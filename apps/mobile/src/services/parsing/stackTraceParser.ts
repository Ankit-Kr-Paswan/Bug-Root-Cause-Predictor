import { ParsedErrorInfo, ParsedStackFrame, ProgrammingLanguage } from '../../domain/types';

/**
 * Robust stack trace and error message parser for JavaScript/TypeScript and Python.
 * Extracts:
 * - Language detection
 * - Exception / Error Type
 * - Error message payload
 * - Call stack frames (filename, function, line, col, app code vs dependency)
 * - HTTP status codes
 */

export class StackTraceParser {
  /**
   * Main parsing entry point
   */
  public static parse(rawText: string, suggestedLang?: ProgrammingLanguage): ParsedErrorInfo {
    const text = rawText.trim();
    const language = suggestedLang && suggestedLang !== 'unknown'
      ? suggestedLang
      : this.detectLanguage(text);

    let exceptionType: string | undefined;
    let message: string | undefined;
    const stackFrames: ParsedStackFrame[] = [];
    let httpStatusCode: number | undefined;

    // Check for HTTP status codes (e.g., "status 404", "HTTP 500", "code 401")
    const httpMatch = text.match(/(?:status|statuscode|http|code)[\s:=]+([45]\d\d)\b/i);
    if (httpMatch) {
      httpStatusCode = parseInt(httpMatch[1], 10);
    }

    if (language === 'python') {
      const pyResult = this.parsePython(text);
      exceptionType = pyResult.exceptionType;
      message = pyResult.message;
      stackFrames.push(...pyResult.stackFrames);
    } else {
      // Default to JavaScript / Node / Generic parser
      const jsResult = this.parseJavaScript(text);
      exceptionType = jsResult.exceptionType;
      message = jsResult.message;
      stackFrames.push(...jsResult.stackFrames);
    }

    // Determine root file and line from highest-priority application frame
    let rootFile: string | undefined;
    let rootLine: number | undefined;

    const appFrame = stackFrames.find((f) => f.isAppCode) || stackFrames[0];
    if (appFrame) {
      rootFile = appFrame.filePath || appFrame.fileName;
      rootLine = appFrame.lineNumber;
    }

    return {
      language,
      exceptionType,
      message,
      stackFrames,
      rootFile,
      rootLine,
      httpStatusCode,
    };
  }

  /**
   * Heuristic language detector based on stack trace signatures
   */
  public static detectLanguage(text: string): ProgrammingLanguage {
    if (
      text.includes('Traceback (most recent call last):') ||
      /File ".*?", line \d+/i.test(text) ||
      /\b(NameError|AttributeError|KeyError|ImportError|ModuleNotFoundError|IndentationError|SyntaxError|ZeroDivisionError|FileNotFoundError)\b:/.test(text)
    ) {
      return 'python';
    }

    if (
      text.includes('at ') && /\bat (?:async )?[\w.$<>]+ \([^)]+:\d+:\d+\)/.test(text) ||
      /\b(TypeError|ReferenceError|RangeError|SyntaxError|URIError|EvalError)\b:/.test(text) ||
      text.includes('node_modules')
    ) {
      return 'javascript';
    }

    if (
      /\b(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|ECONNRESET)\b/i.test(text) ||
      /\b(FetchError|AxiosError|NetworkError)\b/i.test(text)
    ) {
      return 'network';
    }

    if (
      /\b(Sequelize|TypeORM|Prisma|Mongoose|MongoServerSelectionError|pg_hba\.conf|OperationalError|IntegrityError)\b/i.test(text)
    ) {
      return 'database';
    }

    return 'generic';
  }

  /**
   * Parse Node.js / V8 JavaScript stack traces
   * Example:
   * TypeError: Cannot read properties of undefined (reading 'map')
   *     at UserList (src/components/UserList.tsx:42:15)
   *     at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
   */
  private static parseJavaScript(text: string): {
    exceptionType?: string;
    message?: string;
    stackFrames: ParsedStackFrame[];
  } {
    const lines = text.split('\n');
    let exceptionType: string | undefined;
    let message: string | undefined;
    const stackFrames: ParsedStackFrame[] = [];

    // First matching line for ExceptionType: message
    for (const line of lines) {
      const match = line.match(/^([A-Za-z0-9_]+Error|[A-Z][a-zA-Z0-9]+Exception):\s*(.*)$/);
      if (match) {
        exceptionType = match[1];
        message = match[2].trim();
        break;
      }
    }

    // Fallback if no specific Error prefix
    if (!exceptionType && lines.length > 0) {
      const firstLine = lines[0].trim();
      if (!firstLine.startsWith('at ') && firstLine.length < 150) {
        message = firstLine;
      }
    }

    // Parse V8 'at ...' stack frame lines
    // Formats:
    // "    at functionName (path/to/file.ts:12:34)"
    // "    at path/to/file.ts:12:34"
    const frameRegex = /^\s*at\s+(?:(async\s+)?([^\s(]+)\s+\((.*?):(\d+):(\d+)\)|(.*?):(\d+):(\d+))/;

    for (const line of lines) {
      const match = line.match(frameRegex);
      if (match) {
        if (match[3]) {
          // Format with function name: at func (file:line:col)
          const functionName = match[2];
          const fullPath = match[3];
          const lineNumber = parseInt(match[4], 10);
          const columnNumber = parseInt(match[5], 10);
          const fileName = fullPath.split('/').pop()?.split('\\').pop();
          const isAppCode = !fullPath.includes('node_modules') && !fullPath.startsWith('internal/');

          stackFrames.push({
            raw: line.trim(),
            functionName,
            filePath: fullPath,
            fileName,
            lineNumber,
            columnNumber,
            isAppCode,
          });
        } else if (match[6]) {
          // Format without function name: at file:line:col
          const fullPath = match[6];
          const lineNumber = parseInt(match[7], 10);
          const columnNumber = parseInt(match[8], 10);
          const fileName = fullPath.split('/').pop()?.split('\\').pop();
          const isAppCode = !fullPath.includes('node_modules') && !fullPath.startsWith('internal/');

          stackFrames.push({
            raw: line.trim(),
            filePath: fullPath,
            fileName,
            lineNumber,
            columnNumber,
            isAppCode,
          });
        }
      }
    }

    return { exceptionType, message, stackFrames };
  }

  /**
   * Parse Python Tracebacks
   * Example:
   * Traceback (most recent call last):
   *   File "/app/services/user_service.py", line 42, in get_user
   *     return users[user_id]
   * KeyError: '123'
   */
  private static parsePython(text: string): {
    exceptionType?: string;
    message?: string;
    stackFrames: ParsedStackFrame[];
  } {
    const lines = text.split('\n');
    let exceptionType: string | undefined;
    let message: string | undefined;
    const stackFrames: ParsedStackFrame[] = [];

    // In Python tracebacks, the error type is at the bottom
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const match = line.match(/^([a-zA-Z0-9_]+Error|[a-zA-Z0-9_]+Exception):\s*(.*)$/);
      if (match) {
        exceptionType = match[1];
        message = match[2].trim();
        break;
      }
    }

    // Parse '  File "...", line 12, in func'
    const frameRegex = /^\s*File\s+"(.*?)",\s+line\s+(\d+)(?:,\s+in\s+(.*))?/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(frameRegex);
      if (match) {
        const fullPath = match[1];
        const lineNumber = parseInt(match[2], 10);
        const functionName = match[3]?.trim();
        const fileName = fullPath.split('/').pop()?.split('\\').pop();
        const isAppCode =
          !fullPath.includes('site-packages') &&
          !fullPath.includes('dist-packages') &&
          !fullPath.startsWith('/usr/lib') &&
          !fullPath.includes('lib/python');

        stackFrames.push({
          raw: line.trim(),
          filePath: fullPath,
          fileName,
          lineNumber,
          functionName,
          isAppCode,
        });
      }
    }

    return { exceptionType, message, stackFrames };
  }
}
