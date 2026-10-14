import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { AnalysisRepository } from '../../../database/AnalysisRepository';
import { ENGINE_VERSION } from '../../../services/diagnostics/diagnosticEngine';
import { KNOWLEDGE_BASE_VERSION } from '../../../services/knowledge/knowledgeBase';
import { Spacing, Typography, BorderRadius } from '../../../theme';

export const SettingsScreen: React.FC = () => {
  const { colors, themeMode, setThemeMode } = useTheme();

  const handleClearHistory = () => {
    Alert.alert(
      'Clear SQLite History',
      'Are you sure you want to delete all saved analyses from your device? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            await AnalysisRepository.getInstance().clearAll();
            Alert.alert('Success', 'Local analysis history has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & System</Text>

        {/* Theme Settings */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE & THEME
          </Text>
          <View style={styles.themeRow}>
            {[
              { id: 'dark', label: 'Dark Mode', icon: 'moon-outline' as const },
              { id: 'light', label: 'Light Mode', icon: 'sunny-outline' as const },
              { id: 'system', label: 'System Default', icon: 'phone-portrait-outline' as const },
            ].map((t) => {
              const active = themeMode === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setThemeMode(t.id as any)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.surfaceBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name={t.icon}
                    size={18}
                    color={active ? '#FFFFFF' : colors.text}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: active ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Diagnostic Engine & Model Status */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DIAGNOSTIC ENGINE & ML STATUS
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Diagnostic Engine
            </Text>
            <Badge label={`v${ENGINE_VERSION} Rules`} variant="primary" size="sm" />
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Knowledge Base
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              v{KNOWLEDGE_BASE_VERSION} (Bundled Offline)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              ML Inference Pipeline
            </Text>
            <Badge label="Adapter Ready" variant="success" size="sm" />
          </View>

          <Text style={[styles.noteText, { color: colors.textMuted }]}>
            The architecture supports drop-in replacement with a custom scikit-learn / ONNX model via the InferenceEngine interface.
          </Text>
        </Card>

        {/* Privacy & Storage */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DATA STORAGE & PRIVACY
          </Text>
          <View style={styles.privacyItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <View style={styles.privacyContent}>
              <Text style={[styles.privacyHeading, { color: colors.text }]}>
                100% On-Device Processing
              </Text>
              <Text style={[styles.privacyText, { color: colors.textMuted }]}>
                Error messages and stack traces are analyzed solely in your device memory and stored in local SQLite. No cloud backends or remote telemetry servers are contacted.
              </Text>
            </View>
          </View>

          <Button
            title="Clear SQLite History"
            variant="danger"
            size="sm"
            onPress={handleClearHistory}
            style={styles.clearBtn}
          />
        </Card>

        {/* About Card */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            <Text style={{ fontWeight: '700' }}>Bug Root Cause Predictor</Text> is an offline-first mobile application built with React Native, TypeScript, Expo, and SQLite.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  headerTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  themeRow: {
    gap: Spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  privacyContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  privacyHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  clearBtn: {
    marginTop: Spacing.xs,
  },
  aboutText: {
    ...Typography.bodyMedium,
    lineHeight: 20,
  },
});
