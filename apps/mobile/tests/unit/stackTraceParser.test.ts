import { StackTraceParser } from '../../src/services/parsing/stackTraceParser';

describe('StackTraceParser', () => {
  describe('JavaScript Stack Traces', () => {
    it('parses V8 TypeError with function name and file line', () => {
      const trace = `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:42:15)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)`;

      const parsed = StackTraceParser.parse(trace);

      expect(parsed.language).toBe('javascript');
      expect(parsed.exceptionType).toBe('TypeError');
      expect(parsed.message).toBe("Cannot read properties of undefined (reading 'map')");
      expect(parsed.stackFrames.length).toBe(2);

      const appFrame = parsed.stackFrames[0];
      expect(appFrame.functionName).toBe('UserList');
      expect(appFrame.filePath).toBe('src/components/UserList.tsx');
      expect(appFrame.lineNumber).toBe(42);
      expect(appFrame.columnNumber).toBe(15);
      expect(appFrame.isAppCode).toBe(true);

      const depFrame = parsed.stackFrames[1];
      expect(depFrame.isAppCode).toBe(false);
      expect(parsed.rootFile).toBe('src/components/UserList.tsx');
      expect(parsed.rootLine).toBe(42);
    });
  });

  describe('Python Tracebacks', () => {
    it('parses Python AttributeError and file/line origins', () => {
      const trace = `Traceback (most recent call last):
  File "/app/services/auth_service.py", line 64, in verify_token
    payload = jwt_decode(token)
  File "/app/services/user_service.py", line 112, in get_user_profile
    return user.get_formatted_name()
AttributeError: 'NoneType' object has no attribute 'get_formatted_name'`;

      const parsed = StackTraceParser.parse(trace);

      expect(parsed.language).toBe('python');
      expect(parsed.exceptionType).toBe('AttributeError');
      expect(parsed.message).toBe("'NoneType' object has no attribute 'get_formatted_name'");
      expect(parsed.stackFrames.length).toBe(2);
      expect(parsed.stackFrames[0].lineNumber).toBe(64);
      expect(parsed.stackFrames[1].lineNumber).toBe(112);
      expect(parsed.rootFile).toBe('/app/services/auth_service.py');
    });
  });

  describe('Network and HTTP Status Detection', () => {
    it('extracts HTTP 500 status code from raw error message', () => {
      const errorMsg = 'AxiosError: Request failed with status code 500 at http://api.service.internal';
      const parsed = StackTraceParser.parse(errorMsg);

      expect(parsed.httpStatusCode).toBe(500);
      expect(parsed.language).toBe('network');
    });

    it('identifies ECONNREFUSED as network failure', () => {
      const errorMsg = 'connect ECONNREFUSED 127.0.0.1:5432';
      const parsed = StackTraceParser.parse(errorMsg);

      expect(parsed.language).toBe('network');
    });
  });
});
