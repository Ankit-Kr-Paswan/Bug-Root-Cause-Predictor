import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootCauseCandidate } from '../../domain/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { BorderRadius, Spacing, Typography } from '../../theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface RankedCauseCardProps {
  candidate: RootCauseCandidate;
  rank: number;
}

export const RankedCauseCard: React.FC<RankedCauseCardProps> = ({
  candidate,
  rank,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(rank === 1); // Expand top ranked candidate by default

  const getScoreBadgeVariant = (score?: number) => {
    if (!score) return 'info';
    if (score >= 0.8) return 'critical';
    if (score >= 0.5) return 'warning';
    return 'info';
  };

  return (
    <Card
      style={styles.card}
      borderColor={rank === 1 ? colors.surfaceBorderFocused : colors.surfaceBorder}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.rankContainer}>
          <View
            style={[
              styles.rankBadge,
              {
                backgroundColor:
                  rank === 1 ? colors.primary : colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.rankText,
                { color: rank === 1 ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              #{rank}
            </Text>
          </View>
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: colors.text }]}>
              {candidate.title}
            </Text>
            {candidate.scoreLabel ? (
              <Badge
                label={candidate.scoreLabel}
                variant={getScoreBadgeVariant(candidate.score)}
                size="sm"
                style={styles.scoreBadge}
              />
            ) : null}
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      <Text style={[styles.explanation, { color: colors.textSecondary }]}>
        {candidate.explanation}
      </Text>

      {expanded && (
        <View style={styles.details}>
          {candidate.suggestedChecks.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Troubleshooting Checks:
              </Text>
              {candidate.suggestedChecks.map((check, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.checkItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.surfaceBorder,
                    },
                  ]}
                >
                  <View style={styles.checkHeader}>
                    <Text style={[styles.checkTitle, { color: colors.text }]}>
                      {idx + 1}. {check.title}
                    </Text>
                    <Badge
                      label={`${check.risk} risk`}
                      variant={
                        check.risk === 'low'
                          ? 'success'
                          : check.risk === 'medium'
                          ? 'warning'
                          : 'critical'
                      }
                      size="sm"
                    />
                  </View>
                  <Text style={[styles.checkReason, { color: colors.textMuted }]}>
                    {check.reason}
                  </Text>
                  {check.instructions.map((inst, iIdx) => (
                    <Text
                      key={iIdx}
                      style={[styles.instruction, { color: colors.textSecondary }]}
                    >
                      • {inst}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {candidate.suggestedRemedies && candidate.suggestedRemedies.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Suggested Remedies:
              </Text>
              {candidate.suggestedRemedies.map((remedy, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.remedyBox,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.surfaceBorder,
                    },
                  ]}
                >
                  <Text style={[styles.remedyTitle, { color: colors.primaryLight }]}>
                    {remedy.title}
                  </Text>
                  <Text style={[styles.remedyDesc, { color: colors.textSecondary }]}>
                    {remedy.description}
                  </Text>
                  {remedy.codeSnippet ? (
                    <View
                      style={[
                        styles.codeBox,
                        { backgroundColor: colors.codeBackground },
                      ]}
                    >
                      <Text style={[styles.codeText, { color: colors.codeText }]}>
                        {remedy.codeSnippet}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  scoreBadge: {
    marginTop: 4,
  },
  explanation: {
    ...Typography.bodyMedium,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  details: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  section: {
    marginTop: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  checkItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkTitle: {
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  checkReason: {
    fontSize: 12,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 4,
  },
  remedyBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  remedyTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  remedyDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  codeBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    ...Typography.code,
  },
});
