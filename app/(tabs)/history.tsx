import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { MonthCard } from '../../src/components/MonthCard';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import { sortMonthsDesc } from '../../src/utils/dateUtils';
import { fontScale, scale } from '../../src/utils/scaling';

export default function HistoryScreen() {
  const router = useRouter();
  const { months } = useTrading();
  const { isDark } = useTheme();
  
  const sortedMonths = [...months].sort((a, b) => sortMonthsDesc(a.month, b.month));
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  if (months.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.bg }}>
        <View style={{ paddingHorizontal: scale(20), paddingTop: scale(20), paddingBottom: scale(16) }}>
          <Text style={{ fontSize: fontScale(28), fontWeight: '700', color: themeColors.text }}>History</Text>
        </View>
        <EmptyState
          title="No History"
          message="Your monthly trading records will appear here"
          actionLabel="Add First Month"
          onAction={() => router.push('/add-month')}
          icon="📅"
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.bg }}>
      <View style={{ paddingHorizontal: scale(20), paddingTop: scale(20), paddingBottom: scale(16) }}>
        <Text style={{ fontSize: fontScale(28), fontWeight: '700', color: themeColors.text }}>History</Text>
        <Text style={{ fontSize: fontScale(14), color: themeColors.textMuted, marginTop: scale(4) }}>
          {months.length} months recorded
        </Text>
      </View>
      
      <FlatList
        data={sortedMonths}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: scale(12) }}>
            <MonthCard
              month={item}
              onPress={() => router.push(`/month-details/${item.id}`)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: scale(120) }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
