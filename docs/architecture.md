# Bug Root Cause Predictor: Architecture Documentation

## 1. System Vision

Bug Root Cause Predictor is an offline-first cross-platform mobile application (React Native + TypeScript + Expo) that analyzes software error messages and stack traces to identify root causes and deliver actionable remediation steps without needing an internet connection.

```mermaid
flowchart TD
    User([Developer / User]) --> InputScreen[Error Input Screen / Log Import]
    InputScreen --> Coordinator[Analysis Service Coordinator]
    
    subgraph Privacy_Layer [Security & Privacy]
        Coordinator --> Redactor[Secret & Credential Redactor]
    end

    subgraph Core_Engine [Offline Diagnostic Engine]
        Redactor --> Parser[Multi-Language Stack Trace Parser]
        Parser --> Evidence[Evidence & Signature Extractor]
        Evidence --> DiagnosticEngine[Rule-Based Diagnostic Engine]
        Evidence --> InferenceContract[InferenceEngine Interface]
        InferenceContract -.-> DevPredictor[Development Deterministic Predictor]
        InferenceContract -.-> FutureML[Future Custom ML Model (scikit-learn / ONNX)]
        DiagnosticEngine --> KnowledgeBase[(Bundled Knowledge Base)]
        DiagnosticEngine --> CandidateRanker[Candidate Ranker & Scorer]
    end

    CandidateRanker --> ResultScreen[Analysis Results Screen]
    ResultScreen --> SQLite[(SQLite Local Storage)]
    ResultScreen --> ExportService[Native Report Exporter / Share]
```

---

## 2. Layered Architecture

1. **Presentation Layer (`src/features/`, `src/components/`, `src/theme/`)**:
   - Built with React Native & Expo.
   - Fully reactive dark & light theme system.
   - Screen hierarchy: Onboarding, Home, Error Input, Analysis Results, History, Details, Settings.
   - Accessible UI components with semantic roles and high-contrast color badges.

2. **Domain Layer (`src/domain/types.ts`)**:
   - Pure TypeScript entities: `AnalysisRequest`, `AnalysisResult`, `RootCauseCandidate`, `EvidenceItem`, `SuggestedCheck`, `ParsedErrorInfo`.
   - Framework-agnostic contracts defining interfaces for `InferenceEngine` and `DiagnosticEngine`.

3. **Diagnostic Layer (`src/services/diagnostics/`, `src/services/parsing/`)**:
   - Structured stack trace parser for JavaScript/TypeScript (V8 engine formats) and Python (traceback frames).
   - Scoped keyword and signature matchers.
   - Heuristic candidate scorer ranking probable causes by weight.

4. **Inference Layer (`src/services/inference/`)**:
   - Clean, stable `InferenceEngine` interface: `predict(request, parsed): Promise<PredictionOutput>`.
   - `DevelopmentInferenceEngine` adapter ensures complete testability before custom ML model training.

5. **Data Layer (`src/database/`)**:
   - SQLite local persistence via `expo-sqlite`.
   - Versioned, transaction-safe database migrations.
   - `AnalysisRepository` data access layer separating database queries from presentation screens.

6. **Knowledge Layer (`src/services/knowledge/`, `knowledge-base/`)**:
   - Bundled, versioned knowledge base (`v1.0.0`) of error categories, cause explanations, verification steps, and code remedies.
