/**
 * Core Domain Types & Contracts for Bug Root Cause Predictor
 * Aligned with prompt specifications Section 8
 */

export type ProgrammingLanguage =
  | 'javascript'
  | 'python'
  | 'network'
  | 'database'
  | 'generic'
  | 'unknown';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EvidenceKind =
  | 'exception'
  | 'stack_frame'
  | 'keyword'
  | 'rule_match'
  | 'http_status'
  | 'env_var';

export interface EvidenceItem {
  kind: EvidenceKind;
  description: string;
  value?: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  snippet?: string;
}

export interface SuggestedCheck {
  title: string;
  instructions: string[];
  reason: string;
  risk: 'low' | 'medium' | 'high';
}

export interface SuggestedRemedy {
  title: string;
  description: string;
  codeSnippet?: string;
  docUrl?: string;
}

export interface RootCauseCandidate {
  id: string;
  title: string;
  explanation: string;
  score?: number; // uncalibrated heuristic likelihood score (0.0 to 1.0)
  scoreLabel?: string; // e.g. "High Likelihood", "Moderate Match"
  evidence: EvidenceItem[];
  suggestedChecks: SuggestedCheck[];
  suggestedRemedies?: SuggestedRemedy[];
}

export interface ParsedStackFrame {
  raw: string;
  functionName?: string;
  fileName?: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  isAppCode?: boolean; // false if from node_modules, internal runtime, or stdlib
}

export interface ParsedErrorInfo {
  language: ProgrammingLanguage;
  exceptionType?: string;
  message?: string;
  stackFrames: ParsedStackFrame[];
  rootFile?: string;
  rootLine?: number;
  httpStatusCode?: number;
  isRedacted?: boolean;
}

export interface AnalysisRequest {
  text: string;
  language?: ProgrammingLanguage;
  sourceType?: 'manual_paste' | 'file_import';
  fileName?: string;
}

export interface PredictionOutput {
  category: string;
  candidates: RootCauseCandidate[];
  confidenceScore?: number;
  confidenceLabel?: string;
  modelIdentifier: string;
  modelVersion: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  language: ProgrammingLanguage;
  category: string;
  summary: string;
  originalInput: string;
  parsedInfo: ParsedErrorInfo;
  candidates: RootCauseCandidate[];
  limitations: string[];
  engineType: 'rules' | 'development' | 'ml' | 'hybrid';
  engineVersion: string;
  modelVersion?: string;
  isFavorite?: boolean;
}

export interface InferenceEngine {
  predict(request: AnalysisRequest, parsed: ParsedErrorInfo): Promise<PredictionOutput>;
}

export interface DiagnosticEngine {
  diagnose(request: AnalysisRequest, parsed: ParsedErrorInfo): Promise<AnalysisResult>;
}

export interface HistoryFilter {
  searchQuery?: string;
  language?: ProgrammingLanguage;
  category?: string;
  isFavorite?: boolean;
}
