import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../app/navigation/types';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { RankedCauseCard } from '../../../components/results/RankedCauseCard';
import { EvidenceSection } from '../../../components/results/EvidenceSection';
import { ReportExporter } from '../../../services/export/reportExporter';
import { AnalysisRepository } from '../../../database/AnalysisRepository';
import { Spacing, Typography, BorderRadius } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisResult'>;

export const AnalysisResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { result } = route.params;

  const [isFavorite, setIsFavorite] = useState(result.isFavorite || false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleToggleFavorite = async () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      await AnalysisRepository.getInstance().toggleFavorite(result.id, nextState);
    } catch (err) {
      console.warn('Failed to update favorite status:', err);
    }
  };

  const handleCopyReport = async () => {
    try {
      await ReportExporter.copyToClipboard(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy report to clipboard.');
    }
  };

  const handleShareReport = async () => {
    try {
      await ReportExporter.shareReport(result);
    } catch (err: any) {
      Alert.alert('Share Failed', err.message || 'Unable to share report.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category & Status Bar */}
        <View style={styles.topBar}>
          <View style={styles.badgeRow}>
            <Badge
              label={result.category}
              variant={result.category.includes('Runtime') ? 'critical' : 'primary'}
            />
            <Badge label={result.language} variant="neutral" />
          </View>

          <Button
            title={isFavorite ? 'Saved' : 'Save'}
            variant="ghost"
            size="sm"
            icon={
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={18}
                color={isFavorite ? colors.warning : colors.textMuted}
              />
            }
            onPress={handleToggleFavorite}
          />
        </View>

        {/* Diagnosis Summary Card */}
        <Card style={styles.summaryCard} borderColor={colors.surfaceBorderFocused}>
          <Text style={[styles.summaryHeading, { color: colors.textSecondary }]}>
            DIAGNOSTIC SUMMARY
          </Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {result.summary}
          </Text>
          <Text style={[styles.engineStamp, { color: colors.textMuted }]}>
            Engine: {result.engineVersion}
          </Text>
        </Card>

        {/* Extracted Evidence Component */}
        <EvidenceSection
          parsedInfo={result.parsedInfo}
          evidenceItems={result.candidates[0]?.evidence || []}
        />

        {/* Ranked Candidate Causes */}
        <View style={styles.sectionHeadingRow}>
          <Ionicons name="list-outline" size={18} color={colors.primaryLight} />
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Ranked Root Causes & Remediation
          </Text>
        </View>

        {result.candidates.map((candidate, idx) => (
          <RankedCauseCard key={candidate.id} candidate={candidate} rank={idx + 1} />
        ))}

        {/* Transparent Limitations Section */}
        <Card style={styles.limitationsCard}>
          <View style={styles.limitationsHeader}>
            <Ionicons name="shield-outline" size={18} color={colors.warning} />
            <Text style={[styles.limitationsTitle, { color: colors.warning }]}>
              Limitations & Transparency
            </Text>
          </View>
          {result.limitations.map((lim, idx) => (
            <Text key={idx} style={[styles.limitationItem, { color: colors.textMuted }]}>
              • {lim}
            </Text>
          ))}
        </Card>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <Button
            title={copySuccess ? 'Copied!' : 'Copy Report'}
            variant="secondary"
            icon={
              <Ionicons
                name={copySuccess ? 'checkmark' : 'copy-outline'}
                size={16}
                color={colors.text}
              />
            }
            onPress={handleCopyReport}
            style={styles.actionBtn}
          />
          <Button
            title="Share"
            variant="secondary"
            icon={<Ionicons name="share-social-outline" size={16} color={colors.text} />}
            onPress={handleShareReport}
            style={styles.actionBtn}
          />
        </View>

        <Button
          title="Analyze Another Error"
          icon={<Ionicons name="arrow-back-outline" size={16} color="#FFFFFF" />}
          onPress={() => navigation.navigate('ErrorInput')}
          style={styles.anotherBtn}
        />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  summaryText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    lineHeight: 22,
  },
  engineStamp: {
    fontSize: 11,
    marginTop: Spacing.sm,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  limitationsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  limitationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  limitationsTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  limitationItem: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  anotherBtn: {
    marginTop: Spacing.xs,
  },
});
