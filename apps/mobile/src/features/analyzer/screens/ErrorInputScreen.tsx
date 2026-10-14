import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../app/navigation/types';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { ProgrammingLanguage } from '../../../domain/types';
import { AnalysisService } from '../../../services/analysis/analysisService';
import { DocumentReaderService } from '../../../services/file-import/documentReader';
import { Button } from '../../../components/common/Button';
import { Banner } from '../../../components/common/Banner';
import { Spacing, Typography, BorderRadius } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ErrorInput'>;

const LANGUAGES: Array<{ label: string; value: ProgrammingLanguage }> = [
  { label: 'Auto Detect', value: 'unknown' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Network', value: 'network' },
  { label: 'Database', value: 'database' },
];

export const ErrorInputScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const initialText = route.params?.initialText || '';
  const initialLang = route.params?.language || 'unknown';

  const [text, setText] = useState(initialText);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(initialLang);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.initialText) {
      setText(route.params.initialText);
    }
    if (route.params?.language) {
      setSelectedLanguage(route.params.language);
    }
  }, [route.params]);

  const handlePaste = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        setText(clipboardText);
        setErrorMessage(null);
      }
    } catch {
      Alert.alert('Clipboard Error', 'Could not access clipboard.');
    }
  };

  const handleImportFile = async () => {
    try {
      const file = await DocumentReaderService.pickAndReadLogFile();
      if (file) {
        setText(file.content);
        setErrorMessage(null);
      }
    } catch (err: any) {
      Alert.alert('Import Failed', err.message || 'Unable to import file.');
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter or paste an error message or stack trace.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Small timeout to allow UI transition
      const result = await AnalysisService.analyzeError(text, selectedLanguage);
      setLoading(false);
      navigation.navigate('AnalysisResult', { result });
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'An error occurred during analysis.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {errorMessage && (
            <Banner
              type="critical"
              title="Analysis Error"
              message={errorMessage}
              style={styles.banner}
            />
          )}

          {/* Language Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              TARGET LANGUAGE / CONTEXT
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langRow}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.value;
                return (
                  <TouchableOpacity
                    key={lang.value}
                    activeOpacity={0.7}
                    onPress={() => setSelectedLanguage(lang.value)}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.langText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Quick Toolbar */}
          <View style={styles.toolbar}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              INPUT ERROR OR STACK TRACE
            </Text>
            <View style={styles.toolButtons}>
              <TouchableOpacity
                onPress={handlePaste}
                style={[styles.miniButton, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="clipboard-outline" size={14} color={colors.text} />
                <Text style={[styles.miniText, { color: colors.text }]}>Paste</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleImportFile}
                style={[styles.miniButton, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="folder-open-outline" size={14} color={colors.text} />
                <Text style={[styles.miniText, { color: colors.text }]}>Import</Text>
              </TouchableOpacity>

              {text.length > 0 && (
                <TouchableOpacity
                  onPress={() => setText('')}
                  style={[styles.miniButton, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.critical} />
                  <Text style={[styles.miniText, { color: colors.critical }]}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Multiline Editor */}
          <View
            style={[
              styles.editorContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <TextInput
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Paste stack trace, exception message, or log snippet here..."
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={(val) => {
                setText(val);
                if (errorMessage) setErrorMessage(null);
              }}
              style={[styles.input, { color: colors.text }]}
              textAlignVertical="top"
            />
          </View>

          {/* Character counter & info */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {text.length.toLocaleString()} characters
            </Text>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              🔒 100% Offline Processing
            </Text>
          </View>

          {/* Submit Action */}
          <Button
            title={loading ? 'Diagnosing...' : 'Run Analysis'}
            icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
            onPress={handleAnalyze}
            size="lg"
            loading={loading}
            disabled={!text.trim() || loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  banner: {
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
  },
  langChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  toolButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  miniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  miniText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  editorContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minHeight: 220,
    padding: Spacing.md,
  },
  input: {
    ...Typography.code,
    minHeight: 200,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  metaText: {
    fontSize: 11,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
});
