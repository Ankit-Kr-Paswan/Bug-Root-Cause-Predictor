import { AnalysisRequest, AnalysisResult, ProgrammingLanguage } from '../../domain/types';
import { StackTraceParser } from '../parsing/stackTraceParser';
import { RuleBasedDiagnosticEngine } from '../diagnostics/diagnosticEngine';
import { SecretRedactor } from '../../utils/redaction';
import { AnalysisRepository } from '../../database/AnalysisRepository';

export class AnalysisService {
  private static readonly MAX_INPUT_CHARS = 100_000; // 100k character limit

  /**
   * Orchestrates the complete end-to-end analysis lifecycle:
   * Validation -> Redaction -> Parsing -> Rule Diagnostics -> Persistence
   */
  public static async analyzeError(
    text: string,
    suggestedLang?: ProgrammingLanguage,
    saveToHistory = true
  ): Promise<AnalysisResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Please enter or paste an error message or stack trace.');
    }

    if (trimmed.length > this.MAX_INPUT_CHARS) {
      throw new Error(
        `Input exceeds maximum length of ${this.MAX_INPUT_CHARS.toLocaleString()} characters.`
      );
    }

    // 1. Redact secrets, keys, and tokens for privacy
    const redactionResult = SecretRedactor.redact(trimmed);

    // 2. Parse structured stack frames & exceptions
    const parsed = StackTraceParser.parse(redactionResult.text, suggestedLang);
    parsed.isRedacted = redactionResult.hasRedactions;

    // 3. Request object
    const request: AnalysisRequest = {
      text: redactionResult.text,
      language: parsed.language,
    };

    // 4. Run rule-based diagnostic engine
    const result = RuleBasedDiagnosticEngine.diagnose(request, parsed);

    // 5. Persist to local SQLite storage
    if (saveToHistory) {
      try {
        await AnalysisRepository.getInstance().save(result);
      } catch (err) {
        console.warn('Failed to save analysis to SQLite history:', err);
      }
    }

    return result;
  }
}
