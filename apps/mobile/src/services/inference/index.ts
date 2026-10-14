import {
  AnalysisRequest,
  InferenceEngine,
  ParsedErrorInfo,
  PredictionOutput,
} from '../../domain/types';
import { RuleBasedDiagnosticEngine } from '../diagnostics/diagnosticEngine';

/**
 * Development deterministic inference adapter.
 * Serves as the stable contract interface for the future custom ML model
 * (Python scikit-learn / ONNX Runtime) as described in prompt.md Section 9.
 */
export class DevelopmentInferenceEngine implements InferenceEngine {
  public readonly identifier = 'development-rule-inference-adapter';
  public readonly version = '0.1.0-dev';

  public async predict(
    request: AnalysisRequest,
    parsed: ParsedErrorInfo
  ): Promise<PredictionOutput> {
    // Uses the deterministic rule engine as the development predictor
    const diagnosis = RuleBasedDiagnosticEngine.diagnose(request, parsed);
    const topCandidate = diagnosis.candidates[0];

    return {
      category: diagnosis.category,
      candidates: diagnosis.candidates,
      confidenceScore: topCandidate?.score,
      confidenceLabel: topCandidate?.scoreLabel,
      modelIdentifier: this.identifier,
      modelVersion: this.version,
    };
  }
}

/**
 * Primary inference engine factory/provider.
 * When the ML model is trained and exported, swap the instance here
 * without modifying any UI components or database layers.
 */
export const activeInferenceEngine: InferenceEngine = new DevelopmentInferenceEngine();
