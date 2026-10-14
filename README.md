# Bug Root Cause Predictor 🐞🔍

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_57-61DAFB?logo=react)](https://reactnative.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Persistence-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Offline First](https://img.shields.io/badge/Offline-100%25_On--Device-success)](docs/privacy.md)
[![Tests](https://img.shields.io/badge/Tests-11_Passed-brightgreen)](docs/testing.md)

**Bug Root Cause Predictor** is an offline-first mobile application built for developers to diagnose software exceptions, stack traces, and error logs locally on Android and iOS devices.

It extracts key evidence (originating file, line number, exception signature), runs deterministic rule-based pattern matching, ranks candidate root causes, and provides step-by-step troubleshooting playbooks—completely offline with zero cloud latency and total privacy.

---

## 📸 Architecture & System Design

```
+-------------------------------------------------------------------------+
|                       Presentation Layer (UI)                           |
|   Onboarding | Home (Quick Samples) | Error Input | Results | History   |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                     Business Logic / Domain Layer                       |
|   - Multi-Language Stack Parser (JavaScript / Python / Network / DB)   |
|   - Secret & Token Redaction Engine                                     |
|   - Rule-Based Diagnostic Engine (Bundled Knowledge Base v1.0.0)        |
|   - Inference Engine Adapter (Ready for Custom ML Model)                |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                        Data & Storage Layer                             |
|   - SQLite Local Database (expo-sqlite) with Schema Migrations          |
|   - Native Document Picker (Log file import)                            |
|   - Native Report Exporter & Sharing (Markdown generation)              |
+-------------------------------------------------------------------------+
```

---

## 🚀 Key Features

- **⚡ 100% Offline Capability**: Runs completely on-device. Zero network requests required during analysis.
- **🛡️ Privacy & Secret Redaction**: Automatically detects and masks JWTs, API keys, GitHub tokens, and database passwords before analysis or storage.
- **🧠 Multi-Language Error Parsing**: Formats and parses JavaScript (V8 stack frames) and Python tracebacks.
- **🎯 Ranked Root Cause Candidates**: Ranks causes by likelihood score with transparent evidence linkage.
- **🛠️ Actionable Remediation**: Provides concrete verification checks with risk ratings (low/medium/high) and code snippets.
- **💾 Local SQLite History**: Full persistence with search, filtering by language/category, favorites, and one-click data deletion.
- **📄 Native Report Export**: Generates and shares Markdown analysis reports.
- **🤖 Modular ML Interface**: Built around an `InferenceEngine` interface ready for scikit-learn / ONNX model drop-in.

---

## 🛠️ Technology Stack

- **Mobile Application**: React Native, Expo (SDK 57), TypeScript (Strict Mode).
- **Navigation**: React Navigation (Native Stack + Bottom Tabs).
- **Persistence**: SQLite via `expo-sqlite` with versioned migrations.
- **Testing**: Jest, `jest-expo`, `ts-jest`.
- **System Design & Future ML**: Python 3.11+, scikit-learn, ONNX Runtime.

---

## 💻 Getting Started & Development

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- npm >= 9
- Android Studio / Xcode (for device builds or emulators)
- Expo Go app on your physical mobile device

### Installation
```bash
# Clone the repository
git clone https://github.com/Ankit-Kr-Paswan/Bug-Root-Cause-Predictor.git
cd Bug-Root-Cause-Predictor/apps/mobile

# Dependencies are managed with npm
npm install
```

### Running Locally
```bash
# Start Metro bundler
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator / device (macOS required)
npm run ios

# Run web preview
npm run web
```

### Running Automated Tests & Type Checks
```bash
# Run Jest unit test suite
npm test

# Run TypeScript strict type verification
npm run typecheck
```

---

## 📁 Repository Structure

```
Bug-Root-Cause-Predictor/
├── apps/
│   └── mobile/
│       ├── App.tsx                   # Main application entry
│       ├── app.json                  # Expo configuration
│       ├── package.json              # Dependencies and scripts
│       ├── src/
│       │   ├── app/                  # Navigation & Theme providers
│       │   ├── components/           # Reusable UI cards, buttons, badges
│       │   ├── domain/               # Domain types & inference interfaces
│       │   ├── database/             # SQLite migrations & repository
│       │   ├── features/             # Home, Input, Results, History, Settings
│       │   ├── services/             # Parser, Diagnostics, Inference, Export
│       │   ├── theme/                # Light & dark theme palettes
│       │   └── utils/                # Redaction utilities
│       └── tests/unit/               # Automated Jest test suites
├── docs/
│   ├── architecture.md               # Detailed layered architecture
│   ├── future-ml-integration.md      # scikit-learn / ONNX blueprint
│   ├── privacy.md                    # Privacy & local storage guarantees
│   └── testing.md                    # Testing & offline verification steps
├── knowledge-base/
│   └── schemas/                      # Rule JSON schema
├── ml/                               # Future ML training subsystem
├── prompt/                           # Master prompt and infographic design
└── README.md
```

---

## 📄 License
MIT License. Built for software developers seeking rapid, private root cause debugging.
