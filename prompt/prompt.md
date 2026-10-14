# MASTER PROJECT PROMPT: BUG ROOT CAUSE PREDICTOR

## 1. Your Role

Act as a senior mobile application architect, React Native engineer, TypeScript specialist, software testing engineer, UI/UX designer, and applied ML systems engineer.

Your task is to design and implement a complete, maintainable, production-oriented cross-platform mobile application named **Bug Root Cause Predictor**.

Do not merely provide an architecture document, a tutorial, sample snippets, or a static UI prototype. Build the actual application incrementally, with working functionality, a clean codebase, automated tests, and clear documentation.

Work directly in the project workspace when file-editing and terminal tools are available. Inspect the existing project before modifying it. Preserve working code, avoid unnecessary rewrites, and verify changes with appropriate commands and tests.

If you cannot execute commands or modify files directly, provide complete file contents and precise setup instructions instead of claiming that code has been implemented or tested.

---

## 2. Project Overview

Bug Root Cause Predictor is an offline-first mobile application that helps developers understand software errors.

Users should be able to paste an error message, enter a stack trace, or import a supported local log file. The application should analyze the supplied information and display:

- The detected error category.
- Likely root causes, ranked by relevance.
- Evidence extracted from the supplied error.
- Relevant file paths, line numbers, and exception signatures when present.
- Troubleshooting steps and possible fixes.
- A transparent explanation of uncertainty and limitations.
- The ability to save, reopen, search, and delete previous analyses.

The application must support Android and iOS from one shared React Native codebase.

### Critical development constraint

I will train my own machine-learning model later, after the mobile application and supporting infrastructure have been developed.

**Do not block the project on ML training. Do not fabricate a trained model, real training metrics, or claimed model accuracy.**

Build the app using a modular inference interface and a functional rule-based diagnostic engine. Include a deterministic development/test predictor where appropriate, clearly identified as a development implementation. Later, I must be able to replace this implementation with my own trained model without rewriting the screens, database, or application architecture.

---

## 3. Technology Stack

Use these technologies unless a concrete compatibility issue justifies a documented alternative.

### Mobile application
- React Native.
- TypeScript with strict type checking.
- Expo with development builds and prebuild when appropriate, unless a required native capability makes bare React Native the better-supported choice.
- React Navigation for navigation.
- A lightweight, well-maintained state-management solution; prefer local component state and Context for simple concerns.
- A maintained form-validation solution where useful.
- A consistent, accessible component and theme system.

### Local persistence
- SQLite using a compatible, maintained React Native SQLite library.
- Versioned database migrations.
- A repository/data-access layer separating database code from UI components.

### ML and diagnostic infrastructure
- A TypeScript inference interface.
- A rule-based diagnostic engine that works without an ML model.
- A parser for common error messages and stack traces.
- A bundled, versioned troubleshooting knowledge base.
- A future integration point for a model trained using Python and scikit-learn.
- An optional future ONNX Runtime integration only after mobile compatibility has been verified.

### Quality and development tools
- ESLint.
- Prettier.
- TypeScript strict mode.
- Jest and React Native Testing Library, or compatible maintained alternatives.
- Appropriate unit, component, integration, and platform tests.
- Git and a useful `.gitignore`.
- A CI workflow for linting, type checking, and automated tests.

Before adding dependencies, check their current compatibility with the selected React Native and Expo versions. Avoid abandoned libraries, duplicate dependencies, unnecessary native modules, and unverified APIs.

Do not assume that every Python scikit-learn pipeline can be exported directly to ONNX. Design the model adapter so the actual deployment method can be selected and tested later.

---

## 4. Mandatory Architecture

Use a modular, feature-oriented architecture with clear separation of responsibilities.

Organize the code into these conceptual layers:

### Presentation layer
Responsible for screens, components, navigation, input handling, accessibility, and user feedback.

### Application layer
Coordinates user actions, validates requests, orchestrates analyses, and maps service results into UI-friendly data.

### Domain layer
Contains framework-independent entities, types, interfaces, validation rules, and business logic.

### Diagnostic layer
Contains stack-trace parsing, exception detection, feature extraction, rule matching, candidate ranking, and evidence generation.

### Inference layer
Defines the interface for local predictions. The initial implementation may use a clearly labeled development predictor; the future implementation will load my trained model.

### Data layer
Contains SQLite configuration, migrations, repositories, local file access, and history management.

### Knowledge layer
Contains versioned offline troubleshooting guides, diagnostic signatures, remediation suggestions, and references.

The UI must not call SQLite queries, parse stack traces, or invoke model-specific code directly.

Keep platform-specific functionality behind interfaces wherever possible.

---

## 5. Recommended Repository Structure

Create a maintainable project structure similar to this:

rootcause-ai/
- apps/
  - mobile/
    - android/
    - ios/
    - assets/
      - icons/
      - images/
      - models/
      - knowledge/
    - src/
      - app/
        - navigation/
        - providers/
        - theme/
      - components/
        - common/
        - forms/
        - feedback/
        - results/
      - features/
        - home/
        - analyzer/
          - components/
          - screens/
          - hooks/
        - history/
        - reports/
        - settings/
        - onboarding/
      - domain/
        - entities/
        - types/
        - interfaces/
        - validation/
      - services/
        - analysis/
        - inference/
        - parsing/
        - diagnostics/
        - knowledge/
        - storage/
        - file-import/
        - export/
      - database/
        - migrations/
        - repositories/
        - schema/
      - config/
      - utils/
      - constants/
      - types/
    - tests/
      - unit/
      - components/
      - integration/
      - fixtures/
    - app.json or equivalent configuration
    - package.json
    - tsconfig.json
    - README.md
- ml/
  - README.md
  - configs/
  - data/
    - raw/
    - interim/
    - processed/
  - src/
    - ingestion/
    - preprocessing/
    - training/
    - evaluation/
    - export/
  - tests/
  - artifacts/
- knowledge-base/
  - schemas/
  - root-cause-rules/
  - troubleshooting-guides/
- docs/
  - architecture.md
  - data-model.md
  - privacy.md
  - testing.md
  - future-ml-integration.md
  - release-checklist.md
- scripts/
- .github/
  - workflows/
- .gitignore
- README.md
- LICENSE

Adapt the structure to the actual selected framework and its conventions. Do not create empty folders solely to make the tree look impressive. Add files as they become useful.

Keep the mobile app independently buildable. The Python training project must not be a required runtime dependency of the mobile app.

Do not commit datasets, private logs, credentials, generated build directories, or large model artifacts unnecessarily.

---

## 6. Required Application Screens

Build the following screens with a consistent visual design.

### A. Onboarding screen

Explain what the application does, that analysis runs locally, and that results are predictions rather than guaranteed diagnoses.

Include an option to skip onboarding. Do not force users to create accounts.

### B. Home screen

Include:
- Application name and visual identity.
- A prominent “Analyze Error” action.
- A shortcut to import a local log.
- Recent analysis history.
- A small indicator that the core analysis engine works offline.
- A useful empty state for new users.

### C. Error input screen

Include:
- A multiline text editor for error messages and stack traces.
- An optional language selector: JavaScript/Node.js, Python, or Unknown.
- Paste support.
- Local file import for supported text-based formats.
- Clear input and sample-input actions.
- Character or size limits.
- Validation and helpful error messages.
- An Analyze button with loading and cancellation behavior where feasible.

Do not upload the input to a server. Do not request broad file-system access if a platform document picker can provide the required file.

### D. Analysis results screen

Display:
- Detected error category.
- A short human-readable summary.
- Ranked candidate root causes.
- Supporting evidence extracted from the input.
- Relevant file paths and line numbers when present.
- Troubleshooting steps ordered by usefulness.
- Suggested fixes, clearly labeled as suggestions.
- An uncertainty or limitations section.
- The analysis engine and model version used.
- Save, copy, share, and analyze-another actions.

If the engine cannot identify a cause, show an honest fallback instead of manufacturing an answer.

Use clear visual distinctions between extracted facts, rule matches, model predictions, and recommended actions.

Do not display a confidence percentage unless its meaning is defined and its calibration is justified. If only an uncalibrated score exists, label it appropriately.

### E. History screen

Include:
- A list of saved analyses.
- Search.
- Filtering by category and language.
- Sort by newest first.
- Reopening saved analyses.
- Deleting an individual record.
- Clearing history with confirmation.
- Empty, loading, and database-error states.

### F. Analysis details screen

Allow users to reopen a previous analysis with the original input, results, supporting evidence, engine version, and timestamp, subject to the retention settings.

Handle historical analyses created with older engine versions without crashing.

### G. Settings screen

Include:
- Theme preference, including system theme.
- Default programming language.
- History retention and deletion controls.
- Privacy explanation.
- Current engine and knowledge-base version.
- Model status.
- About and limitations.
- A diagnostic information screen that does not expose private error content by default.

Do not implement a model-download button until a safe, verified model update mechanism exists. The initial application should use bundled assets.

### H. Reusable UI components

Create reusable components for:
- Primary and secondary buttons.
- Input fields.
- Cards.
- Error banners.
- Empty states.
- Loading indicators.
- Confirmation dialogs.
- Category labels.
- Evidence sections.
- Ranked-cause cards.
- Troubleshooting steps.
- Version and offline-status indicators.

Avoid building the entire application as one large component.

---

## 7. Diagnostic Engine: Make It Functional Before ML

The application must be useful before I train a model.

Build a modular rule-based diagnostic engine that identifies recognizable error patterns and explains why a rule matched.

Initially support common signatures such as:

- JavaScript TypeError and likely null/undefined access.
- ReferenceError and missing identifiers.
- Python NameError.
- Python TypeError.
- Common Python and JavaScript import/module errors.
- Network connection failures.
- DNS resolution failures.
- HTTP status errors when present in the supplied text.
- Database connection and authentication failures.
- Missing configuration or environment-variable errors.
- Common dependency and build errors.
- Permission errors.
- Timeout errors.
- Memory/resource errors when recognizable from the logs.

These are initial diagnostic rules, not a guarantee that every instance can be diagnosed.

Each rule should have:
- A stable rule identifier.
- A supported error signature.
- A category.
- A human-readable explanation.
- Evidence patterns.
- Candidate causes.
- Suggested verification steps.
- Suggested remedies.
- A version or compatibility marker.
- Optional links to official documentation.

Do not rely on a single broad regular expression for all error parsing. Use structured parsers and small, testable rule modules.

For ambiguous errors, return several possible causes and explain the evidence supporting each. For unsupported inputs, return an unknown or insufficient-information result.

Never automatically execute suggested shell commands, code fixes, SQL, or imported files.

Do not claim to have confirmed a live server, database, API, or repository state based solely on pasted text.

---

## 8. Define a Stable Analysis Interface

Create typed interfaces before implementing individual screens.

Use a contract conceptually similar to:

```ts
type ProgrammingLanguage =
  | "javascript"
  | "python"
  | "unknown";

type EvidenceItem = {
  kind: "exception" | "stack_frame" | "keyword" | "rule_match";
  description: string;
  value?: string;
  filePath?: string;
  lineNumber?: number;
};

type SuggestedCheck = {
  title: string;
  instructions: string[];
  reason: string;
  risk: "low" | "medium" | "high";
};

type RootCauseCandidate = {
  id: string;
  title: string;
  explanation: string;
  score?: number;
  evidence: EvidenceItem[];
  suggestedChecks: SuggestedCheck[];
};

type AnalysisRequest = {
  text: string;
  language: ProgrammingLanguage;
};

type AnalysisResult = {
  id: string;
  createdAt: string;
  category: string;
  summary: string;
  candidates: RootCauseCandidate[];
  limitations: string[];
  engineType: "rules" | "development" | "ml" | "hybrid";
  engineVersion: string;
  modelVersion?: string;
};

interface InferenceEngine {
  predict(
    request: AnalysisRequest
  ): Promise<PredictionOutput>;
}

interface DiagnosticService {
  analyze(
    request: AnalysisRequest
  ): Promise<AnalysisResult>;
}
```

Refine these definitions as needed. Add explicit types for prediction output, parser output, validation errors, engine capabilities, and service failures.

Use consistent error-handling conventions. Avoid `any`, unchecked type assertions, and swallowed exceptions.

Keep the inference interface independent from the database and presentation layer.

---

## 9. Future ML Integration Requirements

Design for my future custom model, but do not train it now.

The future workflow will be:

1. Gather and validate an appropriately licensed dataset.
2. Train the model using Python and scikit-learn on my MacBook.
3. Compare baseline algorithms and evaluate them on held-out data.
4. Export the model and all required preprocessing artifacts.
5. Select a compatible mobile inference approach.
6. Integrate the new inference engine through the existing interface.
7. Verify that mobile preprocessing and predictions agree with the reference implementation.
8. Bundle and version the artifacts with the mobile app.

The future model may use TF-IDF and Logistic Regression initially, but the architecture must not depend on that algorithm.

Prepare a `future-ml-integration.md` document describing:
- Required model metadata.
- Supported category labels and label mapping.
- Text normalization rules.
- Tokenization and vocabulary requirements.
- Input and output contracts.
- Artifact versioning.
- Model compatibility checks.
- Evaluation metrics.
- Mobile inference options.
- Integration and regression tests.

Bundle no fake trained model. If a deterministic development predictor is needed to exercise UI flows, identify it clearly and ensure it cannot be mistaken for a validated ML model.

Keep the future ML project separate from mobile runtime code.

---

## 10. Local Database and Migrations

Use SQLite for local persistence.

Implement versioned migrations and a repository layer.

Store only what is necessary:
- Analysis identifier.
- Creation timestamp.
- Programming language.
- Original error input, if the user chooses to retain it.
- Predicted category and candidate causes.
- Supporting evidence.
- Suggested checks.
- Engine and model versions.
- Favorite or saved status.

Use structured, versioned JSON serialization only where it is appropriate; do not store the entire database as one JSON document.

Requirements:
- Database schema versioning.
- Transaction-safe migrations.
- Stable IDs.
- Parameterized queries.
- Error handling for failed reads and writes.
- Search and filtering.
- History deletion.
- Optional retention settings.
- Tests for migrations and corrupted or incompatible records.

Avoid storing credentials or unnecessary personal information in analysis records. Do not log complete error input to the console in production.

---

## 11. File Import and Report Export

Support importing text-based error logs using the platform document picker.

Requirements:
- Explicitly supported extensions and MIME types.
- Maximum file size.
- File decoding and malformed-text handling.
- Graceful behavior for empty or binary files.
- No automatic execution of imported content.
- No permanent copy of an imported file unless required and explained.
- Clear user feedback on failures.

Support copying results and sharing a report using the native share interface.

Export a readable text or Markdown report first. Consider PDF export later if it adds clear value.

Reports should distinguish:
- Original input.
- Parsed evidence.
- Predicted category.
- Ranked candidate causes.
- Suggested checks.
- Engine/model version.
- Known limitations.

Do not include private input in diagnostic telemetry.

---

## 12. Offline-First Requirements

Offline functionality is mandatory.

After the application is installed, the user must be able to:
- Open the application without an internet connection.
- Enter and analyze errors.
- Use the rule-based diagnostic engine.
- Access the bundled troubleshooting knowledge base.
- Save and reopen history.
- Search and delete history.
- Copy and share locally generated results using available system features.

Do not add:
- Mandatory login.
- A required remote backend.
- Cloud-based inference.
- Remote API calls during analysis.
- Mandatory analytics or crash-reporting services.
- Network access solely to make core features work.

An operating system may require connectivity for certain external share destinations, but analysis itself must not depend on it.

Create a test procedure that verifies core functionality with the device in airplane mode, including a fresh launch.

---

## 13. Security and Privacy

Implement privacy-conscious defaults.

- Do not transmit analysis inputs.
- Avoid logging private stack traces.
- Avoid logging secrets or environment variables.
- Redact recognizable credentials where practical, while explaining that redaction is imperfect.
- Validate imported data.
- Restrict file sizes and processing work.
- Use parameterized database queries.
- Avoid executing generated or suggested fixes.
- Handle malformed inputs safely.
- Keep secrets out of source code and build configuration.
- Explain which data is stored locally and how users can delete it.
- Avoid unnecessary permissions.
- Use secure storage only if a future feature actually requires secrets.

The application must not imply that every possible credential or secret can be detected.

---

## 14. UI/UX and Visual Quality

Design a polished, modern developer-tool application.

Visual direction:
- Professional and clean.
- Readable typography.
- Consistent spacing.
- Strong information hierarchy.
- Accessible color contrast.
- Clear distinction between warnings, evidence, predictions, and recommendations.
- Dark and light themes.
- Native-feeling Android and iOS interactions.
- Responsive layouts for different screen sizes.
- Good keyboard handling for long error input.
- Helpful loading, empty, error, and success states.

Use a restrained developer-tool palette, with a dark navy or neutral foundation and clear accent colors.

Do not overload screens with decorative charts, unnecessary gradients, or excessive animations. Make long stack traces and diagnostic evidence easy to inspect.

Include accessibility labels, screen-reader support, scalable text, and appropriate touch targets.

Do not use placeholder buttons that appear functional but do nothing.

---

## 15. Testing Requirements

Write real tests as features are implemented.

### Unit tests
- Input validation.
- Stack-trace parsing.
- Exception extraction.
- Rule matching.
- Candidate ranking.
- Result formatting.
- Redaction behavior.
- Model adapter contracts.

### Component tests
- Input editor.
- Language selector.
- Analysis result view.
- Ranked-cause cards.
- History list.
- Empty states.
- Confirmation dialogs.

### Integration tests
- Input → parsing → diagnostics → result.
- Result → SQLite persistence.
- SQLite → history list → reopened analysis.
- Delete history.
- Import a supported file.
- Export or share a result.
- Unknown and malformed input.

### Platform tests
- Android build and execution.
- iOS build and execution.
- Navigation and keyboard behavior.
- File picker integration.
- Database migrations.
- Offline operation.
- App backgrounding and restart.

Create representative test fixtures. Never use real private logs, API keys, passwords, or personal data.

Do not report tests as passing unless they have actually been run. Clearly distinguish verified results from tests that still require a physical device.

---

## 16. Performance and Reliability

The application must remain responsive while analyzing long error messages.

Implement:
- Input size limits.
- Efficient parsing.
- Safe handling of large files.
- UI-friendly asynchronous operations where appropriate.
- Duplicate-analysis protection.
- Clear progress and error feedback.
- Cancellation where feasible.
- Bounded history queries and sensible pagination if needed.
- Graceful recovery from database and file errors.

Avoid unnecessary global state and excessive rerenders.

Do not prematurely add complex caching, background processing, or a large dependency stack without evidence that it is needed.

---

## 17. Documentation and Development Setup

Create a complete root `README.md` that explains:
- Project purpose.
- Architecture.
- Technology stack.
- Prerequisites.
- Installation.
- Development commands.
- Android setup.
- iOS setup.
- Running on simulators and physical devices.
- Running tests.
- Linting and type checking.
- Database migrations.
- Offline verification.
- Current diagnostic-engine limitations.
- Future ML integration.

Include a `.env.example` only if environment variables are genuinely needed. Never commit secrets.

Create architecture and privacy documentation that matches the actual implementation.

Since development is on a MacBook, document the relevant setup:
- Node.js using a supported version.
- The selected package manager.
- Xcode for iOS builds and simulators.
- Android Studio and Android SDK for Android builds and emulators.
- CocoaPods or other native dependency setup if required by the chosen workflow.

Use reproducible dependency versions and a lockfile.

Do not claim that an iOS build has been tested merely because it compiles on Android.

---

## 18. Definition of Done

The initial application is complete only when the following conditions have been addressed:

1. The project has a clean and documented architecture.
2. The app builds for Android and has a documented iOS build path.
3. The primary screens are implemented.
4. Error input and supported local file import work.
5. The rule-based diagnostic engine returns useful, evidence-backed results.
6. Unknown and ambiguous errors are handled honestly.
7. Analysis history is persisted in SQLite.
8. Users can reopen and delete saved analyses.
9. Reports can be copied or shared.
10. Core functionality works offline.
11. The inference engine is replaceable without rewriting the UI.
12. A future custom ML model can be integrated through documented interfaces.
13. Type checking, linting and applicable tests pass.
14. Privacy and limitations are documented.
15. There are no fake model metrics, dead buttons, or misleading feature claims.
16. Remaining device-specific or release tasks are explicitly listed.

---

## 19. Required Implementation Workflow

Follow this sequence rather than trying to write the entire project in one giant code dump.

### Phase 1: Inspect and plan
Inspect the repository and existing tooling. Identify missing requirements, dependency compatibility risks, and build constraints. Write a concise implementation plan and proposed file structure.

### Phase 2: Establish the foundation
Set up React Native, TypeScript, navigation, themes, linting, testing, and build configuration. Confirm the development environment and basic application startup.

### Phase 3: Build the UI shell
Implement navigation and all required screens with realistic loading, empty, error, and success states. Use typed mock data only where the corresponding real service is not ready.

### Phase 4: Build the domain and diagnostic engine
Implement typed contracts, validation, parsers, diagnostic rules, evidence extraction, and result formatting. Add tests with representative inputs.

### Phase 5: Build local persistence
Implement SQLite, migrations, repositories, history, search, deletion, and persistence tests.

### Phase 6: Connect the features
Wire input, import, analysis, results, history, and report sharing together. Remove inert mock actions.

### Phase 7: Verify offline operation
Run the app without internet access and verify all core analysis and local storage workflows.

### Phase 8: Hardening and documentation
Run available tests, type checks, linting, and platform builds. Fix defects, document limitations, and prepare the future ML integration guide.

After each phase:
- Summarize what changed.
- List important files created or modified.
- Run relevant checks.
- Report actual results and unresolved issues.
- Continue to the next phase when the preceding work is sufficiently stable.

If a tool, dependency, build environment, or platform capability blocks progress, explain the blocker and implement the best verified alternative. Do not fabricate command output or claim completion without evidence.

---

## 20. Final Instructions

Prioritize functional correctness, maintainability, offline capability, privacy, and a stable architecture over rushing to produce many files.

Do not train an ML model in this stage.

Do not introduce a cloud backend.

Do not rewrite the project in Flutter or another framework.

Do not replace real functionality with static screenshots.

Do not create unnecessary abstractions merely to make the architecture look sophisticated.

Start by inspecting the current workspace. Then propose the implementation plan, establish the project foundation, and proceed phase by phase until the working application is implemented and verified as far as the available environment allows.

The final deliverable should be a maintainable React Native mobile application for Android and iOS, ready for the later integration of my own trained ML model.



make sure to push the code in github in every step:https://github.com/Ankit-Kr-Paswan/Bug-Root-Cause-Predictor

and make the app step by step in phase dont go in one go 

AND MAKE SURE TO PUSH THE CODE STEP BY STEP IN GITHUB WITH PROPER COMMIT WHICH IS SHORT AND CONCISE THIS IS MAJOR THING AS I NEED TO SHOW IT TO MY PROFESSOR .