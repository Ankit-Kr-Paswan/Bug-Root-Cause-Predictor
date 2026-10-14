import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EvidenceItem, ParsedErrorInfo } from '../../domain/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { BorderRadius, Spacing, Typography } from '../../theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface EvidenceSectionProps {
  parsedInfo: ParsedErrorInfo;
  evidenceItems: EvidenceItem[];
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  parsedInfo,
  evidenceItems,
}) => {
  const { colors } = useTheme();
  const [showAllFrames, setShowAllFrames] = useState(false);

  const framesToShow = showAllFrames
    ? parsedInfo.stackFrames
    : parsedInfo.stackFrames.slice(0, 3);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="finger-print-outline" size={20} color={colors.primaryLight} />
        <Text style={[styles.title, { color: colors.text }]}>Extracted Evidence</Text>
      </View>

      {/* Key Diagnostic Facts */}
      <View style={styles.factGrid}>
        {parsedInfo.exceptionType ? (
          <View
            style={[
              styles.factItem,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.surfaceBorder },
            ]}
          >
            <Text style={[styles.factLabel, { color: colors.textMuted }]}>Exception</Text>
            <Text style={[styles.factValue, { color: colors.critical }]}>
              {parsedInfo.exceptionType}
            </Text>
          </View>
        ) : null}

        {parsedInfo.rootFile ? (
          <View
            style={[
              styles.factItem,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.surfaceBorder },
            ]}
          >
            <Text style={[styles.factLabel, { color: colors.textMuted }]}>Origin Location</Text>
            <Text style={[styles.factValue, { color: colors.text }]}>
              {parsedInfo.rootFile}
              {parsedInfo.rootLine ? `:${parsedInfo.rootLine}` : ''}
            </Text>
          </View>
        ) : null}

        {parsedInfo.httpStatusCode ? (
          <View
            style={[
              styles.factItem,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.surfaceBorder },
            ]}
          >
            <Text style={[styles.factLabel, { color: colors.textMuted }]}>HTTP Status</Text>
            <Text style={[styles.factValue, { color: colors.warning }]}>
              {parsedInfo.httpStatusCode}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Evidence Items List */}
      {evidenceItems.length > 0 && (
        <View style={styles.listSection}>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Pattern & Signature Evidence:
          </Text>
          {evidenceItems.map((item, idx) => (
            <View key={idx} style={styles.evidenceRow}>
              <Badge
                label={item.kind}
                size="sm"
                variant={
                  item.kind === 'exception'
                    ? 'critical'
                    : item.kind === 'rule_match'
                    ? 'primary'
                    : 'neutral'
                }
                style={styles.evidenceBadge}
              />
              <Text style={[styles.evidenceDesc, { color: colors.text }]}>
                {item.description}
                {item.value ? ` (${item.value})` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Parsed Stack Frames */}
      {parsedInfo.stackFrames.length > 0 && (
        <View style={styles.stackSection}>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Call Stack Frames:
          </Text>
          {framesToShow.map((frame, idx) => (
            <View
              key={idx}
              style={[
                styles.frameItem,
                {
                  backgroundColor: colors.codeBackground,
                  borderColor: frame.isAppCode ? colors.primaryLight : 'transparent',
                  borderLeftWidth: frame.isAppCode ? 3 : 0,
                },
              ]}
            >
              <Text style={[styles.frameFunc, { color: colors.codeKeyword }]}>
                {frame.functionName || '<anonymous>'}
              </Text>
              <Text style={[styles.frameLocation, { color: colors.codeLineNumber }]}>
                {frame.filePath || frame.fileName || frame.raw}
                {frame.lineNumber ? `:${frame.lineNumber}` : ''}
              </Text>
            </View>
          ))}

          {parsedInfo.stackFrames.length > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllFrames(!showAllFrames)}
              style={styles.toggleFrames}
            >
              <Text style={[styles.toggleText, { color: colors.primaryLight }]}>
                {showAllFrames
                  ? 'Show fewer frames'
                  : `Show all ${parsedInfo.stackFrames.length} frames`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleSmall,
    marginLeft: Spacing.sm,
  },
  factGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  factItem: {
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  factLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  factValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  listSection: {
    marginTop: Spacing.sm,
  },
  subheading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  evidenceBadge: {
    marginRight: Spacing.sm,
  },
  evidenceDesc: {
    flex: 1,
    fontSize: 13,
  },
  stackSection: {
    marginTop: Spacing.md,
  },
  frameItem: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
  },
  frameFunc: {
    ...Typography.code,
    fontWeight: '700',
  },
  frameLocation: {
    ...Typography.code,
    fontSize: 11,
    marginTop: 2,
  },
  toggleFrames: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
