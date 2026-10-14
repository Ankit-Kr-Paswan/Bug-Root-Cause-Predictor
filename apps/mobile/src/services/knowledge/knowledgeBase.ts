import {
  ProgrammingLanguage,
  RootCauseCandidate,
  SuggestedCheck,
  SuggestedRemedy,
} from '../../domain/types';

export interface DiagnosticRule {
  id: string;
  name: string;
  category: string;
  languages: ProgrammingLanguage[];
  description: string;
  match: (params: {
    rawText: string;
    exceptionType?: string;
    message?: string;
    language: ProgrammingLanguage;
    httpStatusCode?: number;
  }) => {
    isMatch: boolean;
    confidence: number; // 0.0 - 1.0
    matchedKeywords: string[];
    evidenceSummary: string;
  };
  candidateCauses: Array<{
    id: string;
    title: string;
    explanation: string;
    scoreWeight: number;
    suggestedChecks: SuggestedCheck[];
    suggestedRemedies?: SuggestedRemedy[];
  }>;
}

export const KNOWLEDGE_BASE_VERSION = '1.0.0';

export const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  // 1. JS TypeError: Null / Undefined property access
  {
    id: 'JS_NULL_UNDEFINED_PROP',
    name: 'Null or Undefined Property Access',
    category: 'Runtime / Type Error',
    languages: ['javascript', 'generic'],
    description: 'An operation attempted to read a property or call a method on an undefined or null value.',
    match: ({ rawText, exceptionType, message }) => {
      const isTypeError = exceptionType === 'TypeError';
      const patterns = [
        /cannot read propert(?:y|ies) of (?:undefined|null)/i,
        /is not a function/i,
        /cannot destructure property .* of (?:undefined|null)/i,
        /undefined is not an object/i,
        /null is not an object/i,
      ];
      const match = patterns.find((p) => p.test(rawText) || (message && p.test(message)));
      const isMatch = isTypeError || Boolean(match);
      return {
        isMatch,
        confidence: match ? 0.95 : isTypeError ? 0.75 : 0,
        matchedKeywords: match ? [match.source] : isTypeError ? ['TypeError'] : [],
        evidenceSummary: 'Detected attempt to access property/method on undefined or null reference.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_async_state_null',
        title: 'Uninitialized Asynchronous State or Deferred API Response',
        explanation: 'Data accessed during initial UI render before an asynchronous API request, promise, or hook resolved.',
        scoreWeight: 0.9,
        suggestedChecks: [
          {
            title: 'Verify State Initialization',
            instructions: [
              'Check whether the object being accessed is loaded from an async query or hook.',
              'Inspect default values in useState() or initial props.',
            ],
            reason: 'Accessing properties of asynchronous state before the data is fetched throws a TypeError during render.',
            risk: 'low',
          },
          {
            title: 'Check Optional Chaining (?.)',
            instructions: [
              'Replace direct nested property access (e.g., user.profile.name) with optional chaining (user?.profile?.name).',
            ],
            reason: 'Optional chaining safely short-circuits to undefined rather than throwing a fatal runtime exception.',
            risk: 'low',
          },
        ],
        suggestedRemedies: [
          {
            title: 'Apply Optional Chaining & Fallback',
            description: 'Use the optional chaining operator (?.) and nullish coalescing operator (??) to prevent fatal crashes.',
            codeSnippet: 'const userName = user?.profile?.name ?? "Anonymous";',
          },
        ],
      },
    ],
  },

  // 2. JS ReferenceError: Undefined identifier / missing import
  {
    id: 'JS_REFERENCE_ERROR',
    name: 'Undefined Identifier or Missing Import',
    category: 'Scope / Reference Error',
    languages: ['javascript', 'generic'],
    description: 'A variable, function, or imported component was referenced before declaration or without being imported.',
    match: ({ rawText, exceptionType, message }) => {
      const isRefError = exceptionType === 'ReferenceError';
      const isMatch = isRefError || /is not defined/i.test(rawText);
      const varMatch = rawText.match(/([a-zA-Z0-9_$]+) is not defined/i);
      return {
        isMatch,
        confidence: isMatch ? 0.92 : 0,
        matchedKeywords: varMatch ? [varMatch[1]] : ['ReferenceError'],
        evidenceSummary: varMatch
          ? `Identifier "${varMatch[1]}" was referenced in scope but never defined or imported.`
          : 'Encountered ReferenceError indicating an out-of-scope identifier.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_missing_import',
        title: 'Missing Module Import or Typo in Identifier Name',
        explanation: 'The variable or component is either not imported at the top of the file, or has a typographical spelling mistake.',
        scoreWeight: 0.88,
        suggestedChecks: [
          {
            title: 'Verify Import Statements',
            instructions: [
              'Search the top of the file for the imported symbol.',
              'Verify whether the export was a default export (import X from "...") or named export (import { X } from "...").',
            ],
            reason: 'Mismatch between default and named exports causes the variable to evaluate to undefined.',
            risk: 'low',
          },
        ],
        suggestedRemedies: [
          {
            title: 'Add Missing Named/Default Import',
            description: 'Ensure the component or utility function is correctly imported.',
            codeSnippet: 'import { missingFunction } from "../utils/helper";',
          },
        ],
      },
    ],
  },

  // 3. Python NameError & AttributeError
  {
    id: 'PY_NAME_ATTR_ERROR',
    name: 'Python NameError or NoneType AttributeError',
    category: 'Python Runtime Error',
    languages: ['python'],
    description: 'Python encountered an undefined variable name or attempted to access an attribute on None.',
    match: ({ rawText, exceptionType }) => {
      const isMatch =
        exceptionType === 'NameError' ||
        exceptionType === 'AttributeError' ||
        /'NoneType' object has no attribute/i.test(rawText);
      return {
        isMatch,
        confidence: isMatch ? 0.94 : 0,
        matchedKeywords: exceptionType ? [exceptionType] : ['AttributeError'],
        evidenceSummary: 'Detected Python NameError or NoneType attribute lookup failure.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_python_none_return',
        title: 'Function Returned None Unexpectedly',
        explanation: 'A function or database query that was expected to return an object returned None (e.g., query returned no results or method lacked a return statement).',
        scoreWeight: 0.9,
        suggestedChecks: [
          {
            title: 'Inspect Return Values',
            instructions: [
              'Check whether the preceding function call explicitly returns a value.',
              'Verify whether the database record or dictionary lookup exists before calling methods on it.',
            ],
            reason: 'Functions without an explicit return statement implicitly return None in Python.',
            risk: 'low',
          },
        ],
        suggestedRemedies: [
          {
            title: 'Add Guard Clause / Walrus Check',
            description: 'Verify the object is not None before invoking its attributes.',
            codeSnippet: 'if user is not None:\n    print(user.name)\nelse:\n    # handle missing user gracefully',
          },
        ],
      },
    ],
  },

  // 4. Python KeyError
  {
    id: 'PY_KEY_ERROR',
    name: 'Python Missing Dictionary Key',
    category: 'Data Structure / KeyError',
    languages: ['python'],
    description: 'An index lookup on a Python dictionary failed because the specified key does not exist.',
    match: ({ exceptionType, rawText }) => {
      const isMatch = exceptionType === 'KeyError' || /KeyError:/i.test(rawText);
      const keyMatch = rawText.match(/KeyError:\s*['"]?([^'"\n]+)['"]?/i);
      return {
        isMatch,
        confidence: isMatch ? 0.95 : 0,
        matchedKeywords: keyMatch ? [keyMatch[1]] : ['KeyError'],
        evidenceSummary: keyMatch
          ? `Missing dictionary key: "${keyMatch[1]}".`
          : 'Encountered KeyError on dictionary access.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_missing_dict_key',
        title: 'Missing Key in Dictionary Payload or Environment',
        explanation: 'The dictionary or JSON payload does not contain the expected field, or the key name has a typo.',
        scoreWeight: 0.92,
        suggestedChecks: [
          {
            title: 'Use dict.get() with Default Fallback',
            instructions: [
              'Replace dict[key] with dict.get(key, default_value).',
              'Inspect incoming JSON keys or payload structure in logs.',
            ],
            reason: 'dict.get() returns a default value instead of raising a KeyError when a key is absent.',
            risk: 'low',
          },
        ],
        suggestedRemedies: [
          {
            title: 'Use .get() Method with Safe Default',
            description: 'Protect against missing keys in untrusted or dynamic JSON.',
            codeSnippet: 'value = payload.get("expected_key", "default_val")',
          },
        ],
      },
    ],
  },

  // 5. Module / Package Not Found
  {
    id: 'MODULE_NOT_FOUND',
    name: 'Module or Package Not Found',
    category: 'Dependency / Environment',
    languages: ['javascript', 'python', 'generic'],
    description: 'The runtime cannot resolve an imported library or local file path.',
    match: ({ rawText, exceptionType }) => {
      const patterns = [
        /cannot find module/i,
        /ModuleNotFoundError/i,
        /ImportError/i,
        /No module named/i,
        /MODULE_NOT_FOUND/i,
      ];
      const match = patterns.find((p) => p.test(rawText));
      return {
        isMatch: Boolean(match) || exceptionType === 'ModuleNotFoundError',
        confidence: match ? 0.96 : 0,
        matchedKeywords: match ? [match.source] : ['ModuleNotFoundError'],
        evidenceSummary: 'Module resolution failed during package or relative path import.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_uninstalled_package',
        title: 'Package Not Installed in Current Environment or Path Typo',
        explanation: 'The dependency is missing from node_modules / virtual environment, or the relative file path has a typo or incorrect casing.',
        scoreWeight: 0.95,
        suggestedChecks: [
          {
            title: 'Check Dependency in package.json / requirements.txt',
            instructions: [
              'Verify that the package is listed under dependencies.',
              'Run npm install (for Node) or pip install (for Python).',
            ],
            reason: 'New dependencies added to a branch must be installed locally.',
            risk: 'low',
          },
          {
            title: 'Verify File System Path & Case Sensitivity',
            instructions: [
              'Check relative paths like "./components/Button" for correct case sensitivity.',
              'Linux/CI environments are case-sensitive while macOS defaults to case-insensitive.',
            ],
            reason: 'Case-sensitive file systems will fail to resolve files if capitalization differs.',
            risk: 'low',
          },
        ],
      },
    ],
  },

  // 6. Network Connection Refused / DNS Failure
  {
    id: 'NETWORK_FAILURE',
    name: 'Network Connection Refused or Host Unreachable',
    category: 'Network / Infrastructure',
    languages: ['network', 'javascript', 'python', 'generic'],
    description: 'A socket or HTTP client failed to connect to the remote host or port.',
    match: ({ rawText }) => {
      const patterns = [
        /ECONNREFUSED/i,
        /ENOTFOUND/i,
        /getaddrinfo/i,
        /EAI_AGAIN/i,
        /ConnectionRefusedError/i,
        /Failed to fetch/i,
        /Network Error/i,
      ];
      const match = patterns.find((p) => p.test(rawText));
      return {
        isMatch: Boolean(match),
        confidence: match ? 0.94 : 0,
        matchedKeywords: match ? [match.source] : [],
        evidenceSummary: 'Connection refused or DNS address lookup failed.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_server_offline',
        title: 'Target Server Offline, Port Mismatch, or Missing Protocol',
        explanation: 'The backend service is not running on the specified port, or the host IP/domain is incorrect (e.g., trying to access localhost from an emulator).',
        scoreWeight: 0.93,
        suggestedChecks: [
          {
            title: 'Verify Server Running & Port Accessibility',
            instructions: [
              'Check if the local dev server or Docker container is currently active.',
              'If testing from an Android emulator, remember that localhost refers to the emulator itself; use 10.0.2.2 instead.',
            ],
            reason: 'Mobile emulators have their own loopback address and cannot access host localhost without a bridge IP.',
            risk: 'low',
          },
        ],
      },
    ],
  },

  // 7. HTTP 401 & 403 Authentication / Authorization
  {
    id: 'HTTP_AUTH_FAILURE',
    name: 'HTTP 401 Unauthorized or 403 Forbidden',
    category: 'Authentication / Security',
    languages: ['network', 'generic', 'javascript', 'python'],
    description: 'The server rejected the request due to missing, invalid, or expired credentials, or insufficient permissions.',
    match: ({ httpStatusCode, rawText }) => {
      const isAuthStatus = httpStatusCode === 401 || httpStatusCode === 403;
      const match = /401\s+Unauthorized|403\s+Forbidden|JWT expired|token invalid|Access denied/i.test(rawText);
      const isMatch = isAuthStatus || match;
      return {
        isMatch,
        confidence: isMatch ? 0.92 : 0,
        matchedKeywords: [httpStatusCode ? `HTTP ${httpStatusCode}` : 'Auth Error'],
        evidenceSummary: 'Detected HTTP authentication or authorization rejection.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_token_expired',
        title: 'Missing or Expired Authorization Token (JWT)',
        explanation: 'The request header Authorization: Bearer <token> was missing, malformed, or the session token has expired.',
        scoreWeight: 0.9,
        suggestedChecks: [
          {
            title: 'Check Token Expiration & Refresh Flow',
            instructions: [
              'Inspect the Bearer token in request headers.',
              'Verify if a token refresh flow should have executed prior to this API call.',
            ],
            reason: 'Expired JWTs receive 401 responses from authenticated REST endpoints.',
            risk: 'low',
          },
        ],
      },
    ],
  },

  // 8. Database Connection & Authentication Failure
  {
    id: 'DATABASE_FAILURE',
    name: 'Database Connection or Authentication Error',
    category: 'Database / Persistence',
    languages: ['database', 'generic'],
    description: 'Database client failed to establish connection or authenticate with user credentials.',
    match: ({ rawText }) => {
      const patterns = [
        /MongoServerSelectionError/i,
        /SequelizeConnectionRefusedError/i,
        /password authentication failed/i,
        /Access denied for user/i,
        /psycopg2.*OperationalError/i,
        /database.*does not exist/i,
      ];
      const match = patterns.find((p) => p.test(rawText));
      return {
        isMatch: Boolean(match),
        confidence: match ? 0.95 : 0,
        matchedKeywords: match ? [match.source] : [],
        evidenceSummary: 'Database connection failed or database authentication credentials rejected.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_db_credentials_service',
        title: 'Database Daemon Stopped or Invalid DB Environment Credentials',
        explanation: 'The database server (PostgreSQL/MySQL/MongoDB) is not running, or DATABASE_URL / DB_PASSWORD credentials do not match.',
        scoreWeight: 0.91,
        suggestedChecks: [
          {
            title: 'Check Database Server Status',
            instructions: [
              'Check if the database service or Docker container is active and listening.',
              'Verify DB host, username, password, and port in .env file.',
            ],
            reason: 'Incorrect database connection strings or stopped services prevent database pool initialization.',
            risk: 'low',
          },
        ],
      },
    ],
  },

  // 9. Permission Denied (EACCES)
  {
    id: 'PERMISSION_DENIED',
    name: 'File System Permission Denied (EACCES)',
    category: 'File System / Security',
    languages: ['generic', 'javascript', 'python'],
    description: 'The operating system denied read or write access to a requested file or directory.',
    match: ({ rawText }) => {
      const match = /EACCES|permission denied|Errno 13.*Permission denied/i.test(rawText);
      return {
        isMatch: match,
        confidence: match ? 0.95 : 0,
        matchedKeywords: ['EACCES', 'Permission denied'],
        evidenceSummary: 'Operating system file permissions prevented read or write access.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_file_permission',
        title: 'Insufficient File Permissions or Read-Only Directory',
        explanation: 'The running process does not possess permission to read or write the targeted file path, or the directory requires elevated privileges.',
        scoreWeight: 0.9,
        suggestedChecks: [
          {
            title: 'Verify File Mode & Ownership',
            instructions: [
              'Check file ownership (ls -la path/to/file).',
              'Grant appropriate read/write permissions for the application user.',
            ],
            reason: 'Processes running under non-root users cannot write to root-owned paths.',
            risk: 'medium',
          },
        ],
      },
    ],
  },

  // 10. Memory / Heap Out of Memory
  {
    id: 'MEMORY_LIMIT_EXCEEDED',
    name: 'Heap Memory Allocation Limit Exceeded',
    category: 'Resource / Memory',
    languages: ['javascript', 'python', 'generic'],
    description: 'The process exceeded the maximum allocated heap size or memory limit.',
    match: ({ rawText }) => {
      const match = /heap out of memory|JavaScript heap out of memory|MemoryError/i.test(rawText);
      return {
        isMatch: match,
        confidence: match ? 0.96 : 0,
        matchedKeywords: ['heap out of memory'],
        evidenceSummary: 'Process crashed due to exceeding allowable virtual memory or heap allocation limit.',
      };
    },
    candidateCauses: [
      {
        id: 'cause_memory_leak_large_payload',
        title: 'Memory Leak or Processing Oversized Dataset into Memory',
        explanation: 'An infinite loop, unbounded cache growth, or loading a massive file into memory exceeded the Node / Python heap limit.',
        scoreWeight: 0.93,
        suggestedChecks: [
          {
            title: 'Check Streaming & Unbounded Collections',
            instructions: [
              'Check whether files or large database queries are loaded into memory at once rather than streamed.',
              'For Node builds, consider increasing NODE_OPTIONS="--max-old-space-size=4096".',
            ],
            reason: 'Streaming processes chunks incrementally rather than accumulating everything in RAM.',
            risk: 'low',
          },
        ],
      },
    ],
  },
];
