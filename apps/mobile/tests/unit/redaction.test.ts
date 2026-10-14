import { SecretRedactor } from '../../src/utils/redaction';

describe('SecretRedactor', () => {
  it('masks Bearer JWT tokens', () => {
    const raw = 'Authorization failed: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThis';
    const result = SecretRedactor.redact(raw);

    expect(result.hasRedactions).toBe(true);
    expect(result.text).toContain('Bearer [REDACTED_JWT_TOKEN]');
    expect(result.text).not.toContain('eyJhbGciOiJIUzI1Ni');
  });

  it('masks GitHub Personal Access Tokens', () => {
    const raw = 'Error connecting to git: remote url https://ghp_012345678901234567890123456789012345@github.com';
    const result = SecretRedactor.redact(raw);

    expect(result.hasRedactions).toBe(true);
    expect(result.text).toContain('[REDACTED_GITHUB_TOKEN]');
    expect(result.text).not.toContain('ghp_012345678901234567890123456789012345');
  });

  it('preserves clean error text without false positive redactions', () => {
    const raw = "TypeError: Cannot read properties of undefined (reading 'length')";
    const result = SecretRedactor.redact(raw);

    expect(result.hasRedactions).toBe(false);
    expect(result.text).toBe(raw);
  });
});
