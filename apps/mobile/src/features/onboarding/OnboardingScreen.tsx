import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Spacing, Typography, BorderRadius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const handleFinish = () => {
    navigation.replace('MainTabs');
  };

  const features = [
    {
      icon: 'shield-checkmark-outline' as const,
      title: '100% Offline Analysis',
      desc: 'All stack traces and error logs stay directly on your device. Zero telemetry, zero cloud calls.',
    },
    {
      icon: 'git-network-outline' as const,
      title: 'Evidence-Backed Root Causes',
      desc: 'Extracts exact file lines, exceptions, and matching rule signatures with verifiable proof.',
    },
    {
      icon: 'build-outline' as const,
      title: 'Actionable Remediation',
      desc: 'Step-by-step diagnostic verification and low-risk fix recommendations tailored to your stack.',
    },
    {
      icon: 'analytics-outline' as const,
      title: 'Future-Ready Inference',
      desc: 'Modular rule engine and architecture designed for seamless custom machine learning model drop-in.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.logoBadge,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.primaryLight },
            ]}
          >
            <Ionicons name="bug" size={40} color={colors.primaryLight} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Bug Root Cause Predictor
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Instant offline diagnostics and intelligent root cause explanations for developers.
          </Text>
        </View>

        <View style={styles.featureList}>
          {features.map((item, idx) => (
            <Card key={idx} style={styles.featureCard}>
              <View style={styles.featureRow}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  <Ionicons name={item.icon} size={24} color={colors.primaryLight} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
            Disclaimer: Analysis results are predictive diagnostic assessments based on offline pattern matching and deterministic heuristics, not guaranteed compile/runtime assertions.
          </Text>
        </View>

        <Button
          title="Get Started"
          onPress={handleFinish}
          size="lg"
          style={styles.startButton}
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
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.titleLarge,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    maxWidth: 320,
  },
  featureList: {
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  featureCard: {
    padding: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimerBox: {
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  startButton: {
    marginTop: Spacing.sm,
  },
});
