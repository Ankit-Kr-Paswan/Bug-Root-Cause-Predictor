# Future Machine Learning Integration Guide

## 1. Overview & Objective

This document outlines the integration blueprint for replacing the initial deterministic development predictor with a custom-trained Machine Learning model trained in Python using `scikit-learn`.

---

## 2. Model Training & Export Pipeline (MacBook)

```mermaid
flowchart LR
    Dataset[(Curated Error Dataset)] --> Preprocess[Text Normalization & Tokenization]
    Preprocess --> Vectorizer[TF-IDF / WordPiece Vectorizer]
    Vectorizer --> Classifier[scikit-learn Classifier\n(Logistic Regression / LightGBM)]
    Classifier --> Evaluation[Held-out Test Evaluation\n(F1 Score, Confusion Matrix)]
    Evaluation --> Export[Export ONNX / JSON Artifacts]
    Export --> MobileApp[Bundle with Mobile App Assets]
```

---

## 3. Preprocessing & Normalization Contract

To guarantee that mobile on-device inference matches Python training results, text inputs must undergo identical normalization:

1. **Lowercasing**: `text.toLowerCase()`
2. **Path Sanitization**: Replace absolute user paths (`/Users/...`, `C:\...`) with `<PATH>` tokens.
3. **Number Masking**: Replace line numbers and memory addresses (`0x7fff...`, `:42:15`) with `<ADDR>` and `<NUM>` tokens.
4. **Tokenization**: Tokenize using whitespace and identifier delimiters (`.`, `_`, `:`, `(`, `)`).
5. **Vocabulary Matching**: The vocabulary dictionary exported from Python (`vocab.json`) will map feature tokens to indices.

---

## 4. Inference Engine Contract Interface

The mobile application defines a clean, modular inference interface in `apps/mobile/src/domain/types.ts`:

```typescript
export interface InferenceEngine {
  predict(
    request: AnalysisRequest,
    parsed: ParsedErrorInfo
  ): Promise<PredictionOutput>;
}
```

### Prediction Output Format
```typescript
export interface PredictionOutput {
  category: string;
  candidates: RootCauseCandidate[];
  confidenceScore?: number; // Calibrated probability (0.0 to 1.0)
  confidenceLabel?: string; // "High Confidence", "Moderate Match"
  modelIdentifier: string;  // e.g. "scikit-tfidf-logistic-v1"
  modelVersion: string;     // e.g. "1.0.0"
}
```

---

## 5. Mobile Deployment Approaches

### Option A: Pure TypeScript Vectorizer + Linear Weights (Lightweight & 100% Native)
- Export TF-IDF `vocabulary.json` and classifier `weights.json` (coefficients and intercepts).
- Evaluate matrix multiplication directly in TypeScript.
- **Pros**: Zero native binary dependencies, 100% portable, tiny bundle footprint (< 500 KB).

### Option B: ONNX Runtime Mobile
- Export scikit-learn pipeline using `skl2onnx`:
  ```python
  from skl2onnx import convert_sklearn
  from skl2onnx.common.data_types import StringTensorType
  
  initial_type = [('input_text', StringTensorType([None, 1]))]
  onx = convert_sklearn(pipeline, initial_types=initial_type)
  with open("model.onnx", "wb") as f:
      f.write(onx.SerializeToString())
  ```
- Load via `onnxruntime-react-native` once verified on target hardware.

---

## 6. Model Verification & Regression Testing

Before bundling any trained model:
1. Run evaluation on held-out test dataset: minimum target macro F1-score >= 0.85 across primary categories.
2. Cross-validate prediction parity between Python `predict_proba()` output and mobile inference on 50 gold-standard error fixtures.
