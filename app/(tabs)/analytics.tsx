import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import { fontScale, scale, screenWidth } from '../../src/utils/scaling';

export default function AnalyticsScreen() {
  const { isDark } = useTheme();
  const { months, stats } = useTrading();
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  const colors = {
    primary: '#10B95F',
    profit: '#10B95F',
    loss: '#EF4444',
  };
  
  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return value < 0 ? `-${formatted}` : formatted;
  };
  
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Calculate analytics
  const profitableMonths = months.filter(m => {
    const pnl = m.endingCapital - m.startingCapital;
    return pnl > 0;
  }).length;
  
  const losingMonths = months.filter(m => {
    const pnl = m.endingCapital - m.startingCapital;
    return pnl < 0;
  }).length;
  
  const bestMonth = months.length > 0 
    ? months.reduce((best, m) => {
        const pnl = m.endingCapital - m.startingCapital;
        const bestPnl = best.endingCapital - best.startingCapital;
        return pnl > bestPnl ? m : best;
      })
    : null;
    
  const worstMonth = months.length > 0
    ? months.reduce((worst, m) => {
        const pnl = m.endingCapital - m.startingCapital;
        const worstPnl = worst.endingCapital - worst.startingCapital;
        return pnl < worstPnl ? m : worst;
      })
    : null;
  
  // Prepare chart data - last 6 months, sorted by date
  const sortedMonths = [...months]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);
  
  const chartLabels = sortedMonths.map(m => {
    const [year, month] = m.month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(month) - 1];
  });
  
  const chartData = sortedMonths.map(m => m.endingCapital - m.startingCapital);
  
  // Calculate cumulative P&L for the line chart
  const cumulativeData = chartData.reduce<number[]>((acc, val) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(last + val);
    return acc;
  }, []);
  
  const hasChartData = sortedMonths.length >= 2;
  
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.bg }}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: scale(20) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginTop: scale(20), marginBottom: scale(24) }}>
          <Text style={{ fontSize: fontScale(28), fontWeight: '700', color: themeColors.text, marginBottom: scale(4) }}>Analytics</Text>
          <Text style={{ fontSize: fontScale(14), color: themeColors.textMuted }}>Your trading performance</Text>
        </View>
        
        {months.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: scale(80) }}>
            <Ionicons name="bar-chart-outline" size={scale(64)} color={themeColors.textMuted} />
            <Text style={{ fontSize: fontScale(20), fontWeight: '600', color: themeColors.text, marginTop: scale(16), marginBottom: scale(8) }}>No Data Yet</Text>
            <Text style={{ fontSize: fontScale(14), color: themeColors.textMuted, textAlign: 'center' }}>Add your first month to see analytics</Text>
          </View>
        ) : (
          <>
            {/* P&L Chart */}
            {hasChartData && (
              <View style={{ backgroundColor: themeColors.card, borderRadius: scale(20), padding: scale(16), marginBottom: scale(16) }}>
                <View style={{ marginBottom: scale(12) }}>
                  <Text style={{ fontSize: fontScale(16), fontWeight: '600', color: themeColors.text }}>Cumulative P&L</Text>
                  <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted, marginTop: scale(2) }}>Last {sortedMonths.length} months</Text>
                </View>
                <LineChart
                  data={{
                    labels: chartLabels,
                    datasets: [{ 
                      data: cumulativeData.length > 0 ? cumulativeData : [0],
                      color: () => colors.primary,
                      strokeWidth: 3,
                    }],
                  }}
                  width={screenWidth - scale(72)}
                  height={scale(180)}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: themeColors.card,
                    backgroundGradientTo: themeColors.card,
                    decimalPlaces: 0,
                    color: () => colors.primary,
                    labelColor: () => themeColors.textMuted,
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: colors.primary,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    },
                  }}
                  bezier
                  style={{ borderRadius: scale(12) }}
                  withInnerLines={true}
                  withOuterLines={false}
                />
              </View>
            )}
            
            {/* Summary Cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: scale(16), rowGap: scale(12) }}>
              <View style={{ width: '48%', padding: scale(16), borderRadius: scale(16), backgroundColor: themeColors.card }}>
                <Text style={{ fontSize: fontScale(12), fontWeight: '500', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: scale(8) }}>Total P&L</Text>
                <Text style={{ fontSize: fontScale(22), fontWeight: '700', color: stats.totalProfitLoss >= 0 ? colors.profit : colors.loss }}>{formatCurrency(stats.totalProfitLoss)}</Text>
              </View>
              
              <View style={{ width: '48%', padding: scale(16), borderRadius: scale(16), backgroundColor: themeColors.card }}>
                <Text style={{ fontSize: fontScale(12), fontWeight: '500', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: scale(8) }}>Win Rate</Text>
                <Text style={{ fontSize: fontScale(22), fontWeight: '700', color: colors.primary }}>{stats.winRate.toFixed(1)}%</Text>
              </View>
              
              <View style={{ width: '48%', padding: scale(16), borderRadius: scale(16), backgroundColor: themeColors.card }}>
                <Text style={{ fontSize: fontScale(12), fontWeight: '500', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: scale(8) }}>Avg Return</Text>
                <Text style={{ fontSize: fontScale(22), fontWeight: '700', color: stats.averageReturn >= 0 ? colors.profit : colors.loss }}>{formatPercentage(stats.averageReturn)}</Text>
              </View>
              
              <View style={{ width: '48%', padding: scale(16), borderRadius: scale(16), backgroundColor: themeColors.card }}>
                <Text style={{ fontSize: fontScale(12), fontWeight: '500', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: scale(8) }}>Total Months</Text>
                <Text style={{ fontSize: fontScale(22), fontWeight: '700', color: themeColors.text }}>{months.length}</Text>
              </View>
            </View>
            
            {/* Win/Loss Breakdown */}
            <View style={{ padding: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, marginBottom: scale(16) }}>
              <Text style={{ fontSize: fontScale(16), fontWeight: '600', color: themeColors.text, marginBottom: scale(16) }}>Win/Loss Breakdown</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: scale(16) }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: scale(12), height: scale(12), borderRadius: scale(6), backgroundColor: colors.profit, marginBottom: scale(8) }} />
                  <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted, marginBottom: scale(4) }}>Profitable</Text>
                  <Text style={{ fontSize: fontScale(24), fontWeight: '700', color: colors.profit }}>{profitableMonths}</Text>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: scale(12), height: scale(12), borderRadius: scale(6), backgroundColor: colors.loss, marginBottom: scale(8) }} />
                  <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted, marginBottom: scale(4) }}>Losing</Text>
                  <Text style={{ fontSize: fontScale(24), fontWeight: '700', color: colors.loss }}>{losingMonths}</Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={{ flexDirection: 'row', height: scale(8), borderRadius: scale(4), overflow: 'hidden', gap: 2 }}>
                <View style={{ height: '100%', borderRadius: scale(4), backgroundColor: colors.profit, flex: profitableMonths || 1 }} />
                <View style={{ height: '100%', borderRadius: scale(4), backgroundColor: colors.loss, flex: losingMonths || 1 }} />
              </View>
            </View>
            
            {/* Best & Worst Month */}
            <View style={{ padding: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, marginBottom: scale(16) }}>
              <Text style={{ fontSize: fontScale(16), fontWeight: '600', color: themeColors.text, marginBottom: scale(16) }}>Performance Extremes</Text>
              
              {bestMonth && (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: scale(12), borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <View style={{ width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: 'rgba(16, 185, 95, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: scale(12) }}>
                    <Ionicons name="trending-up" size={scale(20)} color={colors.profit} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted, marginBottom: scale(2) }}>Best Month</Text>
                    <Text style={{ fontSize: fontScale(14), fontWeight: '600', color: themeColors.text }}>{bestMonth.month}</Text>
                  </View>
                  <Text style={{ fontSize: fontScale(16), fontWeight: '700', color: colors.profit }}>{formatCurrency(bestMonth.endingCapital - bestMonth.startingCapital)}</Text>
                </View>
              )}
              
              {worstMonth && (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: scale(12) }}>
                  <View style={{ width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: scale(12) }}>
                    <Ionicons name="trending-down" size={scale(20)} color={colors.loss} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontScale(12), color: themeColors.textMuted, marginBottom: scale(2) }}>Worst Month</Text>
                    <Text style={{ fontSize: fontScale(14), fontWeight: '600', color: themeColors.text }}>{worstMonth.month}</Text>
                  </View>
                  <Text style={{ fontSize: fontScale(16), fontWeight: '700', color: colors.loss }}>{formatCurrency(worstMonth.endingCapital - worstMonth.startingCapital)}</Text>
                </View>
              )}
            </View>
          </>
        )}
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: scale(120) }} />
      </ScrollView>
    </SafeAreaView>
  );
}
