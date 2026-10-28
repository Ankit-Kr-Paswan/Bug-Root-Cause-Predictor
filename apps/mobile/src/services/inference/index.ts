import {
  AnalysisRequest,
  InferenceEngine,
  ParsedErrorInfo,
  PredictionOutput,
} from '../../domain/types';
import { RuleBasedDiagnosticEngine } from '../diagnostics/diagnosticEngine';
import { MLInferenceEngine } from './MLInferenceEngine';

/**
 * Development deterministic inference adapter.
 * Uses the deterministic rule engine as the baseline development predictor.
 */
export class DevelopmentInferenceEngine implements InferenceEngine {
  public readonly identifier = 'development-rule-inference-adapter';
  public readonly version = '0.1.0-dev';

  public async predict(
    request: AnalysisRequest,
    parsed: ParsedErrorInfo
  ): Promise<PredictionOutput> {
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

export { MLInferenceEngine };

/**
 * Primary inference engine factory/provider.
 * Powered by our custom trained Multinomial Naive Bayes TF-IDF ML model!
 */
export const activeInferenceEngine: InferenceEngine = new MLInferenceEngine();
