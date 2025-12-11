import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import { fontScale, scale } from '../../src/utils/scaling';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CalendarScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { months: monthRecords } = useTrading();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    border: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  const colors = {
    primary: '#10B95F',
    profit: '#10B95F',
    loss: '#EF4444',
    profitAlpha: 'rgba(16, 185, 95, 0.1)',
    lossAlpha: 'rgba(239, 68, 68, 0.1)',
    white: '#FFFFFF',
  };
  
  // Get month data for the selected year
  const getMonthData = (monthIndex: number) => {
    const monthKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return monthRecords.find(m => m.month === monthKey);
  };
  
  // Check if month is in the future
  const isFutureMonth = (monthIndex: number) => {
    const now = new Date();
    return selectedYear > now.getFullYear() || 
      (selectedYear === now.getFullYear() && monthIndex > now.getMonth());
  };
  
  // Calculate profit streak
  const calculateStreak = () => {
    const sortedMonths = [...monthRecords]
      .filter(m => m.status === 'closed')
      .sort((a, b) => b.month.localeCompare(a.month));
    
    let streak = 0;
    for (const month of sortedMonths) {
      if (month.netProfitLoss > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  
  const streak = calculateStreak();
  
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: scale(120) }}>
        {/* Header */}
        <View style={{ padding: scale(20), paddingTop: scale(12) }}>
          <Text style={{ fontSize: fontScale(32), fontWeight: '700', color: themeColors.text }}>Calendar</Text>
        </View>
        
        {/* Streak Card */}
        {streak > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: scale(20), marginBottom: scale(24), padding: scale(16), borderRadius: scale(16), backgroundColor: colors.primary, gap: scale(16) }}>
            <View style={{ width: scale(48), height: scale(48), borderRadius: scale(24), backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: fontScale(24) }}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontScale(14), fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Profit Streak</Text>
              <Text style={{ fontSize: fontScale(24), fontWeight: '700', color: colors.white }}>{streak} months</Text>
            </View>
          </View>
        )}
        
        {/* Year Selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: scale(24), gap: scale(20) }}>
          <TouchableOpacity 
            style={{ width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: themeColors.card, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setSelectedYear(y => y - 1)}
          >
            <Ionicons name="chevron-back" size={scale(20)} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: fontScale(24), fontWeight: '700', color: themeColors.text, minWidth: scale(80), textAlign: 'center' }}>{selectedYear}</Text>
          <TouchableOpacity 
            style={{ width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: themeColors.card, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setSelectedYear(y => y + 1)}
            disabled={selectedYear >= currentYear}
          >
            <Ionicons 
              name="chevron-forward" 
              size={scale(20)} 
              color={selectedYear >= currentYear ? themeColors.textMuted : themeColors.text} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Calendar Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: scale(20), justifyContent: 'center', gap: scale(10) }}>
          {MONTHS.map((month, index) => {
            const data = getMonthData(index);
            const isFuture = isFutureMonth(index);
            
            let bgColor = themeColors.card;
            let statusColor = themeColors.textMuted;
            
            if (data) {
              bgColor = data.netProfitLoss >= 0 ? colors.profitAlpha : colors.lossAlpha;
              statusColor = data.netProfitLoss >= 0 ? colors.profit : colors.loss;
            }
            
            return (
              <TouchableOpacity
                key={month}
                style={{
                  width: scale(100),
                  height: scale(100),
                  borderRadius: scale(16),
                  padding: scale(12),
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  backgroundColor: bgColor,
                  justifyContent: 'space-between',
                  opacity: isFuture ? 0.4 : 1,
                }}
                onPress={() => data && router.push(`/month-details/${data.id}`)}
                disabled={!data || isFuture}
              >
                <Text style={{ fontSize: fontScale(14), fontWeight: '600', color: isFuture ? themeColors.textMuted : themeColors.text }}>
                  {month}
                </Text>
                {data && (
                  <>
                    <Text style={{ fontSize: fontScale(14), fontWeight: '700', color: statusColor }}>
                      {data.netProfitLoss >= 0 ? '+' : ''}
                      ${Math.abs(data.netProfitLoss).toLocaleString()}
                    </Text>
                    <View style={{ width: scale(8), height: scale(8), borderRadius: scale(4), backgroundColor: statusColor, alignSelf: 'flex-end' }} />
                  </>
                )}
                {!data && !isFuture && (
                  <Text style={{ fontSize: fontScale(14), color: themeColors.textMuted }}>-</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: scale(24), gap: scale(24) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
            <View style={{ width: scale(10), height: scale(10), borderRadius: scale(5), backgroundColor: colors.profit }} />
            <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted }}>Profit</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
            <View style={{ width: scale(10), height: scale(10), borderRadius: scale(5), backgroundColor: colors.loss }} />
            <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted }}>Loss</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
            <View style={{ width: scale(10), height: scale(10), borderRadius: scale(5), backgroundColor: themeColors.border }} />
            <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted }}>No Data</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
