import {
  AnalysisRequest,
  InferenceEngine,
  ParsedErrorInfo,
  PredictionOutput,
  RootCauseCandidate,
} from '../../domain/types';

import vocabData from './artifacts/vocab.json';
import modelData from './artifacts/model_weights.json';

interface VocabArtifact {
  vocabulary: Record<string, number>;
  feature_names: string[];
  idf_weights: number[];
}

interface ModelArtifact {
  model_type: string;
  version: string;
  classes: string[];
  class_log_priors: number[];
  feature_log_probs: number[][];
}

const vocab = vocabData as VocabArtifact;
const model = modelData as ModelArtifact;

export class MLInferenceEngine implements InferenceEngine {
  public readonly identifier = 'custom-multinomial-nb-tfidf';
  public readonly version = model.version || '1.0.0';

  /**
   * Preprocess and normalize error text identically to the Python training pipeline.
   */
  public normalizeText(text: string): string {
    let cleaned = text.toLowerCase();
    // Mask file paths
    cleaned = cleaned.replace(/(\/[\w\-.]+)+\/?/g, '<PATH>');
    cleaned = cleaned.replace(/[a-zA-Z]:\\[\w\-.\\]+/g, '<PATH>');
    // Mask line & column numbers
    cleaned = cleaned.replace(/:\d+:\d+/g, ':<LOC>');
    cleaned = cleaned.replace(/line \d+/g, 'line <NUM>');
    // Mask hexadecimal memory addresses
    cleaned = cleaned.replace(/0x[a-f0-9]+/g, '<ADDR>');
    return cleaned.trim();
  }

  /**
   * Tokenize normalized text into clean feature tokens.
   */
  public tokenize(text: string): string[] {
    const rawTokens = text.toLowerCase().match(/[a-z_][a-z0-9_]*/g) || [];
    const stopWords = new Set(['at', 'in', 'of', 'to', 'is', 'as', 'it']);
    return rawTokens.filter((t) => t.length > 1 && !stopWords.has(t));
  }

  /**
   * Transform text tokens into a normalized TF-IDF vector.
   */
  public vectorize(tokens: string[]): number[] {
    const numFeatures = vocab.feature_names.length;
    const vector = new Array(numFeatures).fill(0);
    const docLen = tokens.length > 0 ? tokens.length : 1;

    // Count term frequencies
    const counts = new Map<string, number>();
    for (const t of tokens) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }

    // Multiply TF * IDF
    for (const [term, count] of counts.entries()) {
      const idx = vocab.vocabulary[term];
      if (idx !== undefined && idx < numFeatures) {
        const tf = count / docLen;
        const idf = vocab.idf_weights[idx];
        vector[idx] = tf * idf;
      }
    }

    // Apply L2 Normalization
    let sumSq = 0;
    for (let i = 0; i < numFeatures; i++) {
      sumSq += vector[i] * vector[i];
    }
    if (sumSq > 0) {
      const norm = Math.sqrt(sumSq);
      for (let i = 0; i < numFeatures; i++) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  /**
   * Predict the category probabilities using the loaded Naive Bayes weights.
   */
  public predictProbabilities(vector: number[]): Array<{ category: string; probability: number }> {
    const nClasses = model.classes.length;
    const logLikelihoods = new Array(nClasses).fill(0);

    for (let c = 0; c < nClasses; c++) {
      let score = model.class_log_priors[c];
      const classWeights = model.feature_log_probs[c];
      for (let f = 0; f < vector.length; f++) {
        if (vector[f] > 0) {
          score += vector[f] * classWeights[f];
        }
      }
      logLikelihoods[c] = score;
    }

    // Softmax normalization
    const maxScore = Math.max(...logLikelihoods);
    const expScores = logLikelihoods.map((s) => Math.exp(s - maxScore));
    const totalExp = expScores.reduce((a, b) => a + b, 0);

    const results = model.classes.map((category, idx) => ({
      category,
      probability: totalExp > 0 ? expScores[idx] / totalExp : 0,
    }));

    // Sort descending by probability
    results.sort((a, b) => b.probability - a.probability);
    return results;
  }

  public async predict(
    request: AnalysisRequest,
    parsed: ParsedErrorInfo
  ): Promise<PredictionOutput> {
    const rawInput = request.text || parsed.message || '';
    const normalized = this.normalizeText(rawInput);
    const tokens = this.tokenize(normalized);
    const vector = this.vectorize(tokens);
    const rankedPredictions = this.predictProbabilities(vector);

    const topMatch = rankedPredictions[0];
    const topScore = topMatch ? topMatch.probability : 0.5;

    let scoreLabel: 'High Confidence' | 'Moderate Match' | 'Tentative' = 'Tentative';
    if (topScore >= 0.65) {
      scoreLabel = 'High Confidence';
    } else if (topScore >= 0.35) {
      scoreLabel = 'Moderate Match';
    }

    // Build candidates from the top ranked categories
    const candidates: RootCauseCandidate[] = rankedPredictions.slice(0, 3).map((pred, i) => {
      const isTop = i === 0;
      return {
        id: `ml-candidate-${i + 1}`,
        title: pred.category,
        explanation: `Classified by custom on-device Machine Learning model (${this.identifier} v${this.version}) with ${(pred.probability * 100).toFixed(1)}% statistical probability based on extracted token features.`,
        score: Math.round(pred.probability * 100) / 100,
        scoreLabel: isTop ? scoreLabel : 'Tentative',
        suggestedChecks: [
          {
            title: `Verify ${pred.category} indicators`,
            reason: 'Statistical likelihood from token classification',
            instructions: [
              `Review error signatures matching ${pred.category}`,
              'Check originating stack trace frames for unexpected variable states or network calls',
            ],
            risk: 'low',
          },
        ],
        evidence: tokens.slice(0, 5).map((tok) => ({
          kind: 'keyword' as const,
          description: `Feature token: "${tok}"`,
          value: tok,
        })),
      };
    });

    return {
      category: topMatch?.category || 'Unknown / Ambiguous',
      candidates,
      confidenceScore: topScore,
      confidenceLabel: scoreLabel,
      modelIdentifier: this.identifier,
      modelVersion: this.version,
    };
  }
}
