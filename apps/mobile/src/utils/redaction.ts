/**
 * Redaction utility for developer privacy and security.
 * Masks common secrets, tokens, and credentials in error inputs and stack traces.
 */

export interface RedactionResult {
  text: string;
  hasRedactions: boolean;
  redactedTypes: string[];
}

export class SecretRedactor {
  private static readonly RULES = [
    {
      type: 'Bearer / JWT Token',
      regex: /Bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*/gi,
      replacement: 'Bearer [REDACTED_JWT_TOKEN]',
    },
    {
      type: 'Generic API Key / Secret',
      regex: /(api[_-]?key|secret|token|password|auth[_-]?token)[\s:=]+['"][A-Za-z0-9_\-]{8,}['"]/gi,
      replacement: '$1="[REDACTED_SECRET]"',
    },
    {
      type: 'GitHub / GitLab Personal Access Token',
      regex: /ghp_[A-Za-z0-9]{36}|glpat-[A-Za-z0-9\-]{20}/g,
      replacement: '[REDACTED_GITHUB_TOKEN]',
    },
    {
      type: 'AWS Access Key',
      regex: /AKIA[0-9A-Z]{16}/g,
      replacement: '[REDACTED_AWS_KEY]',
    },
    {
      type: 'Database Password URL',
      regex: /:\/\/[^:]+:([^@]+)@/g,
      replacement: '://[USER]:[REDACTED_PASSWORD]@',
    },
  ];

  public static redact(input: string): RedactionResult {
    let redactedText = input;
    const redactedTypes: string[] = [];

    for (const rule of this.RULES) {
      if (rule.regex.test(redactedText)) {
        redactedTypes.push(rule.type);
        redactedText = redactedText.replace(rule.regex, rule.replacement);
      }
    }

    return {
      text: redactedText,
      hasRedactions: redactedTypes.length > 0,
      redactedTypes,
    };
  }
}
