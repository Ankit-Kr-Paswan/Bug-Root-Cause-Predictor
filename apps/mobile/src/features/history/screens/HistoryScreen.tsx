import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../app/navigation/types';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { EmptyState } from '../../../components/common/EmptyState';
import { AnalysisResult, ProgrammingLanguage } from '../../../domain/types';
import { AnalysisRepository } from '../../../database/AnalysisRepository';
import { Spacing, Typography, BorderRadius } from '../../../theme';

export const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'javascript' | 'python' | 'favorites'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const items = await AnalysisRepository.getInstance().list({
        searchQuery: searchQuery.trim() || undefined,
        language:
          selectedFilter === 'javascript' || selectedFilter === 'python'
            ? (selectedFilter as ProgrammingLanguage)
            : undefined,
        isFavorite: selectedFilter === 'favorites' ? true : undefined,
      });
      setHistory(items);
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    }
  }, [searchQuery, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis record from your device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AnalysisRepository.getInstance().delete(id);
            await fetchHistory();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all saved analyses from SQLite on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AnalysisRepository.getInstance().clearAll();
            await fetchHistory();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header Title & Clear Button */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analysis History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.critical} />
              <Text style={[styles.clearText, { color: colors.critical }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search by category, summary, or error..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={(val) => {
              setSearchQuery(val);
              fetchHistory();
            }}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filtersRow}>
          {[
            { id: 'all', label: 'All' },
            { id: 'javascript', label: 'JavaScript' },
            { id: 'python', label: 'Python' },
            { id: 'favorites', label: 'Starred' },
          ].map((f) => {
            const isSelected = selectedFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setSelectedFilter(f.id as any)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* History List or Empty State */}
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {history.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="No Analyses Found"
              description="Analyze an error from the home screen to persist results locally on your device."
              actionTitle="Analyze New Error"
              onActionPress={() => navigation.navigate('ErrorInput')}
            />
          ) : (
            history.map((item) => (
              <Card
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('AnalysisResult', { result: item })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <Badge
                      label={item.category}
                      variant={item.category.includes('Runtime') ? 'critical' : 'primary'}
                      size="sm"
                    />
                    <Badge label={item.language} variant="neutral" size="sm" />
                    {item.isFavorite && (
                      <Ionicons name="star" size={14} color={colors.warning} />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.id)}
                    style={styles.deleteIcon}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.summary, { color: colors.text }]} numberOfLines={2}>
                  {item.summary}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={[styles.date, { color: colors.textMuted }]}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text style={[styles.causesCount, { color: colors.primaryLight }]}>
                    {item.candidates.length} candidate(s) →
                  </Text>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: Spacing.xxxl,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deleteIcon: {
    padding: 4,
  },
  summary: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  date: {
    fontSize: 11,
  },
  causesCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
