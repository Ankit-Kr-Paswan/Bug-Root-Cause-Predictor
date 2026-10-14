# Testing & Quality Verification Guide

## 1. Automated Test Suites

The test suite covers unit and integration levels across core layers:
- **Stack Trace Parser (`stackTraceParser.test.ts`)**: JavaScript V8 traces, Python tracebacks, network failure signatures, HTTP status code extraction.
- **Diagnostic Engine (`diagnosticEngine.test.ts`)**: Rule evaluation, evidence linking, candidate scoring, and honest fallback for unknown signatures.
- **Secret Redactor (`redaction.test.ts`)**: Privacy redaction of JWTs, GitHub PATs, and preservation of standard error strings.
- **Report Exporter (`reportExporter.test.ts`)**: Markdown generation and formatting.

---

## 2. Running Automated Tests

```bash
cd apps/mobile
npm test
```

To run with coverage:
```bash
npm test -- --coverage
```

To run type checking:
```bash
npm run typecheck
```

---

## 3. Manual Offline Verification Procedure

To verify offline functionality on a physical device or emulator:
1. Launch the application.
2. Put the device into **Airplane Mode** (disable Wi-Fi and Cellular).
3. Tap **Analyze Error** and paste a sample error (e.g. JavaScript TypeError).
4. Tap **Run Analysis**.
5. Verify:
   - Results, evidence, and remediation steps render instantly.
   - Analysis saves to SQLite.
   - The analysis record appears in the **History** tab.
   - Report can be copied to clipboard.
