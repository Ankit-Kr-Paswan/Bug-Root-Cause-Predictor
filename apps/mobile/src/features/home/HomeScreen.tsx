import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AnalysisResult } from '../../domain/types';
import { AnalysisRepository } from '../../database/AnalysisRepository';
import { DocumentReaderService } from '../../services/file-import/documentReader';
import { Spacing, Typography, BorderRadius } from '../../theme';

const SAMPLES = [
  {
    label: 'JS TypeError',
    lang: 'javascript' as const,
    text: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:42:15)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at updateFunctionComponent (node_modules/react-dom/cjs/react-dom.development.js:17356:20)`,
  },
  {
    label: 'Python NoneType',
    lang: 'python' as const,
    text: `Traceback (most recent call last):
  File "/app/services/auth_service.py", line 64, in verify_token
    payload = jwt_decode(token)
  File "/app/services/user_service.py", line 112, in get_user_profile
    return user.get_formatted_name()
AttributeError: 'NoneType' object has no attribute 'get_formatted_name'`,
  },
  {
    label: 'Network ECONNREFUSED',
    lang: 'network' as const,
    text: `FetchError: request to http://localhost:8080/api/v1/auth failed, reason: connect ECONNREFUSED 127.0.0.1:8080
    at ClientRequest.<anonymous> (node_modules/node-fetch/lib/index.js:1491:11)
    at Socket.socketErrorListener (_http_client.js:462:9)`,
  },
];

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const items = await AnalysisRepository.getInstance().list(undefined, 5);
      setRecentAnalyses(items);
    } catch (err) {
      console.warn('Failed to load recent history:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleImportLog = async () => {
    try {
      const file = await DocumentReaderService.pickAndReadLogFile();
      if (file) {
        navigation.navigate('ErrorInput', { initialText: file.content });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to read log file');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header / Brand Identity */}
        <View style={styles.brandRow}>
          <View style={styles.brandTitleArea}>
            <View
              style={[
                styles.brandIconBox,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="bug" size={24} color={colors.primaryLight} />
            </View>
            <View>
              <Text style={[styles.appName, { color: colors.text }]}>Root Cause</Text>
              <Text style={[styles.appSub, { color: colors.textMuted }]}>
                Bug Predictor
              </Text>
            </View>
          </View>

          {/* Offline Status Badge */}
          <View
            style={[
              styles.offlinePill,
              { backgroundColor: colors.successBg, borderColor: colors.successBorder },
            ]}
          >
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.offlineText, { color: colors.success }]}>
              Offline Engine Active
            </Text>
          </View>
        </View>

        {/* Hero Action Card */}
        <Card style={styles.heroCard} borderColor={colors.surfaceBorderFocused}>
          <Text style={[styles.heroHeading, { color: colors.text }]}>
            Diagnose Software Errors
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            Paste a stack trace or import a local log to extract evidence and rank probable root causes locally.
          </Text>

          <View style={styles.heroButtonRow}>
            <Button
              title="Analyze Error"
              icon={<Ionicons name="flash-outline" size={18} color="#FFFFFF" />}
              onPress={() => navigation.navigate('ErrorInput')}
              size="lg"
              style={styles.heroButton}
            />
            <Button
              title="Import Log"
              variant="secondary"
              icon={<Ionicons name="document-text-outline" size={18} color={colors.text} />}
              onPress={handleImportLog}
              size="lg"
              style={styles.importButton}
            />
          </View>
        </Card>

        {/* Quick Testing Samples */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Test Samples
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Try with 1-click
          </Text>
        </View>

        <View style={styles.samplesRow}>
          {SAMPLES.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('ErrorInput', {
                  initialText: s.text,
                  language: s.lang,
                })
              }
              style={[
                styles.sampleChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                },
              ]}
            >
              <Text style={[styles.sampleText, { color: colors.primary }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Analyses Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Analyses
          </Text>
        </View>

        {recentAnalyses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="time-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No analyses yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Analyzed stack traces and error logs will appear here.
            </Text>
          </Card>
        ) : (
          recentAnalyses.map((item) => (
            <Card
              key={item.id}
              style={styles.historyCard}
              onPress={() => navigation.navigate('AnalysisResult', { result: item })}
            >
              <View style={styles.historyHeader}>
                <Badge
                  label={item.category}
                  variant={item.category.includes('Runtime') ? 'critical' : 'primary'}
                  size="sm"
                />
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[styles.historySummary, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.summary}
              </Text>
            </Card>
          ))
        )}
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
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  heroHeading: {
    ...Typography.titleLarge,
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroButton: {
    flex: 1,
  },
  importButton: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  samplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sampleChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  sampleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.titleSmall,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: Spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  historyDate: {
    fontSize: 12,
  },
  historySummary: {
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
});
