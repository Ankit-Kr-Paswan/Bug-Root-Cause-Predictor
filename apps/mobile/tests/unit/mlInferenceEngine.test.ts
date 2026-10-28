import { MLInferenceEngine } from '../../src/services/inference/MLInferenceEngine';
import { AnalysisRequest, ParsedErrorInfo } from '../../src/domain/types';

describe('MLInferenceEngine (On-Device Custom ML Model)', () => {
  let engine: MLInferenceEngine;

  beforeEach(() => {
    engine = new MLInferenceEngine();
  });

  test('normalizes file paths and line numbers identically to training pipeline', () => {
    const raw = 'TypeError: Cannot read properties of undefined\n  at /Users/dev/app/src/index.js:42:15';
    const normalized = engine.normalizeText(raw);

    expect(normalized).toContain('<PATH>');
    expect(normalized).toContain(':<LOC>');
    expect(normalized).not.toContain('/Users/dev/app/src/index.js');
    expect(normalized).not.toContain('42:15');
  });

  test('tokenizes normalized text into valid feature tokens', () => {
    const text = 'typeerror: cannot read properties of undefined (<PATH>:<LOC>)';
    const tokens = engine.tokenize(text);

    expect(tokens).toContain('typeerror');
    expect(tokens).toContain('properties');
    expect(tokens).toContain('undefined');
    // Stopwords should be filtered out
    expect(tokens).not.toContain('of');
  });

  test('correctly predicts Network / Infrastructure for ECONNREFUSED error', async () => {
    const request: AnalysisRequest = {
      text: 'Error: connect ECONNREFUSED 127.0.0.1:8080\n    at TCPConnectWrap.afterConnect (node:net:1494:16)',
      language: 'network',
    };
    const parsed: ParsedErrorInfo = {
      message: request.text,
      language: 'network',
      stackFrames: [],
    };

    const output = await engine.predict(request, parsed);

    expect(output.category).toBe('Network / Infrastructure');
    expect(output.confidenceScore).toBeGreaterThan(0.5);
    expect(output.candidates.length).toBeGreaterThan(0);
    expect(output.modelIdentifier).toBe('custom-multinomial-nb-tfidf');
    expect(output.modelVersion).toBe('1.0.0');
  });

  test('correctly predicts Scope / Reference Error for window undefined', async () => {
    const request: AnalysisRequest = {
      text: 'ReferenceError: window is not defined\n    at setupClient (/workspace/src/client.ts:18:7)',
      language: 'javascript',
    };
    const parsed: ParsedErrorInfo = {
      message: request.text,
      language: 'javascript',
      stackFrames: [],
    };

    const output = await engine.predict(request, parsed);

    expect(output.category).toBe('Scope / Reference Error');
    expect(output.confidenceScore).toBeGreaterThan(0.6);
  });

  test('correctly predicts Runtime / Type Error for null property access', async () => {
    const request: AnalysisRequest = {
      text: "TypeError: Cannot read properties of undefined (reading 'map')\n    at UserList (/app/src/index.js:20:10)",
      language: 'javascript',
    };
    const parsed: ParsedErrorInfo = {
      message: request.text,
      language: 'javascript',
      stackFrames: [],
    };

    const output = await engine.predict(request, parsed);

    expect(output.category).toBe('Runtime / Type Error');
    expect(output.confidenceScore).toBeGreaterThan(0.4);
  });
});
