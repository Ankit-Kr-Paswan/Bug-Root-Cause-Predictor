import { AnalysisResult as AnalysisResultType, ProgrammingLanguage } from '../../domain/types';

export type RootStackParamList = {
  MainTabs: undefined;
  Onboarding: undefined;
  ErrorInput: { initialText?: string; language?: ProgrammingLanguage } | undefined;
  AnalysisResult: { result: AnalysisResultType };
  HistoryDetail: { resultId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};
