import { RuleBasedDiagnosticEngine } from '../../src/services/diagnostics/diagnosticEngine';
import { StackTraceParser } from '../../src/services/parsing/stackTraceParser';
import { AnalysisRequest } from '../../src/domain/types';

describe('RuleBasedDiagnosticEngine', () => {
  it('diagnoses JavaScript null/undefined property access with evidence and checks', () => {
    const rawError = `TypeError: Cannot read properties of undefined (reading 'email')
    at renderProfile (src/views/Profile.tsx:18:12)`;

    const parsed = StackTraceParser.parse(rawError);
    const request: AnalysisRequest = { text: rawError, language: parsed.language };

    const result = RuleBasedDiagnosticEngine.diagnose(request, parsed);

    expect(result.category).toBe('Runtime / Type Error');
    expect(result.candidates.length).toBeGreaterThan(0);

    const topCandidate = result.candidates[0];
    expect(topCandidate.title).toContain('Uninitialized Asynchronous State');
    expect(topCandidate.suggestedChecks.length).toBeGreaterThan(0);
    expect(topCandidate.evidence.some((e) => e.kind === 'exception')).toBe(true);
    expect(result.limitations.length).toBeGreaterThan(0);
    expect(result.engineType).toBe('rules');
  });

  it('diagnoses Python NoneType AttributeError with high confidence', () => {
    const rawError = `Traceback (most recent call last):
  File "main.py", line 10, in run
    res.send()
AttributeError: 'NoneType' object has no attribute 'send'`;

    const parsed = StackTraceParser.parse(rawError);
    const request: AnalysisRequest = { text: rawError, language: parsed.language };

    const result = RuleBasedDiagnosticEngine.diagnose(request, parsed);

    expect(result.category).toBe('Python Runtime Error');
    expect(result.candidates[0].title).toContain('Function Returned None');
  });

  it('provides honest fallback when error signature is unknown', () => {
    const rawError = 'SomeCompletelyUnknownCustomAppError: unexpected state occurred in custom logic';
    const parsed = StackTraceParser.parse(rawError);
    const request: AnalysisRequest = { text: rawError, language: parsed.language };

    const result = RuleBasedDiagnosticEngine.diagnose(request, parsed);

    expect(result.category).toContain('Uncategorized');
    expect(result.candidates[0].scoreLabel).toBe('Heuristic Fallback');
  });
});
