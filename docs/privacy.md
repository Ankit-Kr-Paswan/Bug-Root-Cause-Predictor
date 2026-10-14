# Privacy & Security Policy

## 1. Zero Cloud Transmission Guarantee

**Bug Root Cause Predictor** is designed from the ground up as an offline-first developer tool.
- All stack trace parsing, pattern matching, and inference occur directly on the user's device.
- The application makes **zero** network requests during error diagnosis.
- No analytics, tracking pixels, crash telemetry, or third-party SDKs are embedded in the application.

---

## 2. On-Device Secret & Token Redaction

The application includes an automated redaction engine (`SecretRedactor`) that sanitizes recognized credentials prior to parsing or storing:
- **Bearer / JWT Tokens**: Masked to `Bearer [REDACTED_JWT_TOKEN]`
- **Personal Access Tokens**: GitHub/GitLab tokens masked to `[REDACTED_TOKEN]`
- **AWS Credentials**: Access keys masked to `[REDACTED_AWS_KEY]`
- **Database Connection URIs**: Passwords masked to `://[USER]:[REDACTED_PASSWORD]@`

*Note: While automated redaction catches common patterns, developers are advised to verify that proprietary credentials or sensitive customer data are not pasted.*

---

## 3. Local SQLite Data Management

All analysis history is stored solely inside a private SQLite database (`rootcause_predictor.db`) within the application sandbox.
- Users can search and delete individual records at any time.
- Users can permanently clear all SQLite database records from the **Settings** screen with one click.
- Uninstalling the application automatically removes all local SQLite data.
