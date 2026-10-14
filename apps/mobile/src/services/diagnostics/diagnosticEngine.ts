import {
  AnalysisRequest,
  AnalysisResult,
  EvidenceItem,
  ParsedErrorInfo,
  RootCauseCandidate,
} from '../../domain/types';
import { DIAGNOSTIC_RULES, KNOWLEDGE_BASE_VERSION } from '../knowledge/knowledgeBase';

export const ENGINE_VERSION = '1.0.0';

export class RuleBasedDiagnosticEngine {
  /**
   * Run complete rule-based offline diagnosis
   */
  public static diagnose(
    request: AnalysisRequest,
    parsedInfo: ParsedErrorInfo
  ): AnalysisResult {
    const rawText = request.text;
    const language = parsedInfo.language;

    // 1. Gather baseline evidence directly from parsed error info
    const baselineEvidence: EvidenceItem[] = [];

    if (parsedInfo.exceptionType) {
      baselineEvidence.push({
        kind: 'exception',
        description: `Encountered exception: ${parsedInfo.exceptionType}`,
        value: parsedInfo.exceptionType,
        filePath: parsedInfo.rootFile,
        lineNumber: parsedInfo.rootLine,
      });
    }

    if (parsedInfo.rootFile) {
      baselineEvidence.push({
        kind: 'stack_frame',
        description: `Originating line in source code: ${parsedInfo.rootFile}${
          parsedInfo.rootLine ? `:${parsedInfo.rootLine}` : ''
        }`,
        filePath: parsedInfo.rootFile,
        lineNumber: parsedInfo.rootLine,
      });
    }

    if (parsedInfo.httpStatusCode) {
      baselineEvidence.push({
        kind: 'http_status',
        description: `HTTP Status Code: ${parsedInfo.httpStatusCode}`,
        value: String(parsedInfo.httpStatusCode),
      });
    }

    // 2. Evaluate diagnostic rules
    const matchedCandidates: RootCauseCandidate[] = [];
    let detectedCategory = 'General Software Bug';
    const ruleEvidence: EvidenceItem[] = [];

    for (const rule of DIAGNOSTIC_RULES) {
      // Check language compatibility
      if (
        !rule.languages.includes('generic') &&
        !rule.languages.includes(language) &&
        language !== 'generic'
      ) {
        continue;
      }

      const matchResult = rule.match({
        rawText,
        exceptionType: parsedInfo.exceptionType,
        message: parsedInfo.message,
        language,
        httpStatusCode: parsedInfo.httpStatusCode,
      });

      if (matchResult.isMatch) {
        detectedCategory = rule.category;

        ruleEvidence.push({
          kind: 'rule_match',
          description: matchResult.evidenceSummary,
          value: rule.name,
        });

        // Add candidates from rule
        for (const c of rule.candidateCauses) {
          const score = Math.min(1.0, Math.round(matchResult.confidence * c.scoreWeight * 100) / 100);
          matchedCandidates.push({
            id: c.id,
            title: c.title,
            explanation: c.explanation,
            score,
            scoreLabel:
              score >= 0.85
                ? 'High Confidence Match'
                : score >= 0.65
                ? 'Probable Cause'
                : 'Possible Contributing Factor',
            evidence: [...baselineEvidence, ...ruleEvidence],
            suggestedChecks: c.suggestedChecks,
            suggestedRemedies: c.suggestedRemedies,
          });
        }
      }
    }

    // 3. Fallback if no specific rule matched
    if (matchedCandidates.length === 0) {
      detectedCategory = parsedInfo.exceptionType
        ? `${parsedInfo.exceptionType} (Uncategorized)`
        : 'Uncategorized Error';

      matchedCandidates.push({
        id: 'cause_generic_fallback',
        title: parsedInfo.exceptionType
          ? `Unhandled ${parsedInfo.exceptionType}`
          : 'Generic Runtime or Execution Failure',
        explanation:
          'No matching pattern signature found in the bundled offline knowledge base. Review the top stack frame and originating source code location.',
        score: 0.4,
        scoreLabel: 'Heuristic Fallback',
        evidence: baselineEvidence,
        suggestedChecks: [
          {
            title: 'Inspect Call Stack Origin',
            instructions: [
              'Examine the first non-framework application file and line number shown in the call stack.',
              'Verify variable state and inputs passed into that method.',
            ],
            reason: 'Errors without distinct rule signatures usually stem from application domain logic.',
            risk: 'low',
          },
        ],
      });
    }

    // Sort candidates descending by score
    matchedCandidates.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Summary generator
    const topCandidate = matchedCandidates[0];
    const summary = parsedInfo.rootFile
      ? `Likely caused by "${topCandidate.title}" originating at ${parsedInfo.rootFile}${
          parsedInfo.rootLine ? `:${parsedInfo.rootLine}` : ''
        }.`
      : `Likely caused by "${topCandidate.title}".`;

    const limitations = [
      'Analysis is performed 100% offline using deterministic rule signatures and heuristics.',
      'No live server, database, or repository environment was accessed or modified.',
      'Always verify suggested code fixes and commands in a testing environment before applying to production.',
    ];

    return {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      language,
      category: detectedCategory,
      summary,
      originalInput: rawText,
      parsedInfo,
      candidates: matchedCandidates,
      limitations,
      engineType: 'rules',
      engineVersion: `${ENGINE_VERSION} (KnowledgeBase v${KNOWLEDGE_BASE_VERSION})`,
    };
  }
}
