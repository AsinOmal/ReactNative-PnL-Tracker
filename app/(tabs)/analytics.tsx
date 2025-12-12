import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrivacyAwareText } from '../../src/components/PrivacyAwareText';
import { fonts } from '../../src/config/fonts';
import { usePrivacy } from '../../src/context/PrivacyContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import { formatMonthDisplay } from '../../src/utils/dateUtils';
import { fontScale, scale, screenWidth } from '../../src/utils/scaling';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { months, stats, loadMonths } = useTrading();
  const { togglePrivacyMode, isPrivacyMode } = usePrivacy(); // Use for charts
  const [refreshing, setRefreshing] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, value: number, index: number } | null>(null);
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMonths();
    } catch (error) {
      console.error('Refresh failed', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
    border: isDark ? '#27272A' : '#E4E4E7',
  };
  
  const colors = {
    primary: '#10B95F',
    profit: '#10B95F',
    loss: '#EF4444',
    purple: '#8B5CF6',
    blue: '#3B82F6',
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
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Calculate analytics
  const profitableMonths = months.filter(m => m.netProfitLoss > 0).length;
  const losingMonths = months.filter(m => m.netProfitLoss < 0).length;
  const winRatePercent = months.length > 0 ? (profitableMonths / months.length) * 100 : 0;
  
  const bestMonth = months.length > 0 
    ? months.reduce((best, m) => m.netProfitLoss > best.netProfitLoss ? m : best)
    : null;
    
  const worstMonth = months.length > 0
    ? months.reduce((worst, m) => m.netProfitLoss < worst.netProfitLoss ? m : worst)
    : null;
  
  // Prepare chart data - last 6 months, sorted by date
  const sortedMonths = [...months]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);
  
  const chartLabels = sortedMonths.map(m => {
    const [, month] = m.month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(month) - 1];
  });
  
  const chartData = sortedMonths.map(m => m.netProfitLoss);
  
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
        contentContainerStyle={{ paddingBottom: scale(140) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.text} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: scale(20), paddingTop: scale(16), paddingBottom: scale(24) }}>
          <View>
            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(32), color: themeColors.text }}>Analytics</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.textMuted, marginTop: scale(4) }}>Track your trading performance</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/compare')}
            style={{ 
              width: scale(44), 
              height: scale(44), 
              borderRadius: scale(12), 
              backgroundColor: themeColors.card, 
              justifyContent: 'center', 
              alignItems: 'center',
              borderWidth: 1,
              borderColor: themeColors.border
            }}
          >
            <Ionicons name="git-compare-outline" size={scale(24)} color={themeColors.text} />
          </TouchableOpacity>
        </View>
        
        {months.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: scale(100), paddingHorizontal: scale(40) }}>
            <View style={{ width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: scale(20) }}>
              <Ionicons name="bar-chart-outline" size={scale(40)} color="#6366F1" />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(22), color: themeColors.text, marginBottom: scale(8), textAlign: 'center' }}>No Analytics Yet</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.textMuted, textAlign: 'center', lineHeight: fontScale(22) }}>Add your first trading month to unlock powerful analytics and insights</Text>
          </View>
        ) : (
          <>
            {/* Hero Stats Card */}
            <View style={{ paddingHorizontal: scale(20), marginBottom: scale(20) }}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: scale(24), padding: scale(24), overflow: 'hidden' }}
              >
                {/* Decorative circles */}
                <View style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(20) }}>
                  <View>
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: 'rgba(255,255,255,0.75)', marginBottom: scale(4) }}>Total P&L</Text>
                    <TouchableOpacity onLongPress={togglePrivacyMode} activeOpacity={0.8}>
                      <PrivacyAwareText
                        value={stats.totalProfitLoss}
                        format={formatCurrency}
                        style={{ fontFamily: fonts.extraBold, fontSize: fontScale(36), color: '#FFFFFF' }}
                        maskedValue="••••••"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: scale(56), height: scale(56), borderRadius: scale(16), backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="trending-up" size={scale(28)} color="#FFFFFF" />
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', gap: scale(16) }}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: scale(12), padding: scale(12), alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(11), color: 'rgba(255,255,255,0.7)', marginBottom: scale(4) }}>Win Rate</Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(20), color: '#FFFFFF' }}>{stats.winRate.toFixed(0)}%</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: scale(12), padding: scale(12), alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(11), color: 'rgba(255,255,255,0.7)', marginBottom: scale(4) }}>Avg Return</Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(20), color: '#FFFFFF' }}>{formatPercentage(stats.averageReturn)}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: scale(12), padding: scale(12), alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(11), color: 'rgba(255,255,255,0.7)', marginBottom: scale(4) }}>Months</Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(20), color: '#FFFFFF' }}>{months.length}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
            
            {/* P&L Chart */}
            {hasChartData && (
              <View style={{ paddingHorizontal: scale(20), marginBottom: scale(20) }}>
                <View style={{ backgroundColor: themeColors.card, borderRadius: scale(20), padding: scale(20), borderWidth: 1, borderColor: themeColors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(16) }}>
                    <View>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(17), color: themeColors.text }}>Cumulative P&L</Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(13), color: themeColors.textMuted, marginTop: scale(2) }}>Last {sortedMonths.length} months</Text>
                    </View>
                    <View style={{ backgroundColor: cumulativeData[cumulativeData.length - 1] >= 0 ? 'rgba(16, 185, 95, 0.1)' : 'rgba(239, 68, 68, 0.1)', paddingHorizontal: scale(10), paddingVertical: scale(6), borderRadius: scale(8) }}>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(13), color: cumulativeData[cumulativeData.length - 1] >= 0 ? colors.profit : colors.loss }}>
                        {formatCurrency(cumulativeData[cumulativeData.length - 1] || 0)}
                      </Text>
                    </View>
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
                    width={screenWidth - scale(80)}
                    height={scale(180)}
                    yAxisLabel={isPrivacyMode ? "" : "$"}
                    yAxisSuffix={isPrivacyMode ? "" : ""}
                    formatYLabel={(val) => isPrivacyMode ? "•••" : parseInt(val).toLocaleString()}
                    chartConfig={{
                      backgroundColor: 'transparent',
                      backgroundGradientFrom: themeColors.card,
                      backgroundGradientTo: themeColors.card,
                      decimalPlaces: 0,
                      color: () => colors.primary,
                      labelColor: () => themeColors.textMuted,
                      propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: colors.primary,
                        fill: themeColors.card,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      },
                    }}
                    bezier
                    style={{ borderRadius: scale(12), marginLeft: -scale(16) }}
                    withInnerLines={true}
                    withOuterLines={false}
                    onDataPointClick={({ value, x, y, index }) => {
                      if (isPrivacyMode) return;
                      setTooltip({
                        x, y, value, index
                      });
                      setTimeout(() => setTooltip(null), 3000);
                    }}
                    decorator={() => {
                      return tooltip ? (
                        <View style={{
                          position: 'absolute',
                          left: tooltip.x - 40,
                          top: tooltip.y - 40,
                          backgroundColor: themeColors.text,
                          padding: 8,
                          borderRadius: 8,
                          zIndex: 100
                        }}>
                          <Text style={{ color: themeColors.bg, fontSize: 12, fontWeight: 'bold' }}>
                            {formatCurrency(tooltip.value)}
                          </Text>
                        </View>
                      ) : null;
                    }}
                  />
                </View>
              </View>
            )}
            
            {/* Win/Loss Breakdown */}
            <View style={{ paddingHorizontal: scale(20), marginBottom: scale(20) }}>
              <View style={{ backgroundColor: themeColors.card, borderRadius: scale(20), padding: scale(20), borderWidth: 1, borderColor: themeColors.border }}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(17), color: themeColors.text, marginBottom: scale(20) }}>Win/Loss Breakdown</Text>
                
                <View style={{ flexDirection: 'row', marginBottom: scale(20) }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ width: scale(64), height: scale(64), borderRadius: scale(32), backgroundColor: 'rgba(16, 185, 95, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: scale(12) }}>
                      <Text style={{ fontFamily: fonts.extraBold, fontSize: fontScale(24), color: colors.profit }}>{profitableMonths}</Text>
                    </View>
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: colors.profit }}>Winning</Text>
                  </View>
                  
                  <View style={{ width: 1, backgroundColor: themeColors.border }} />
                  
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ width: scale(64), height: scale(64), borderRadius: scale(32), backgroundColor: 'rgba(239, 68, 68, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: scale(12) }}>
                      <Text style={{ fontFamily: fonts.extraBold, fontSize: fontScale(24), color: colors.loss }}>{losingMonths}</Text>
                    </View>
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: colors.loss }}>Losing</Text>
                  </View>
                </View>
                
                {/* Progress Bar with Labels */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(8) }}>
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: themeColors.textMuted }}>{winRatePercent.toFixed(0)}% Win Rate</Text>
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: themeColors.textMuted }}>{(100 - winRatePercent).toFixed(0)}% Loss Rate</Text>
                  </View>
                  <View style={{ flexDirection: 'row', height: scale(12), borderRadius: scale(6), overflow: 'hidden', gap: 3 }}>
                    <View style={{ height: '100%', borderRadius: scale(6), backgroundColor: colors.profit, flex: profitableMonths || 0.5 }} />
                    <View style={{ height: '100%', borderRadius: scale(6), backgroundColor: colors.loss, flex: losingMonths || 0.5 }} />
                  </View>
                </View>
              </View>
            </View>

            {/* Risk Analysis */}
            <View style={{ paddingHorizontal: scale(20), marginBottom: scale(20) }}>
              <View style={{ backgroundColor: themeColors.card, borderRadius: scale(20), padding: scale(20), borderWidth: 1, borderColor: themeColors.border }}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(17), color: themeColors.text, marginBottom: scale(20) }}>Risk Analysis</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(16) }}>
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>Avg Win</Text>
                     <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: colors.profit, marginTop: scale(4) }}>{formatCurrency(stats.averageWin || 0)}</Text>
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>Avg Loss</Text>
                     <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: colors.loss, marginTop: scale(4) }}>{formatCurrency(stats.averageLoss || 0)}</Text>
                   </View>
                </View>

                <View style={{ height: 1, backgroundColor: themeColors.border, marginVertical: scale(8) }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(8) }}>
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>Profit Factor</Text>
                     <Text style={{ fontFamily: fonts.extraBold, fontSize: fontScale(24), color: themeColors.text, marginTop: scale(4) }}>
                        {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
                     </Text>
                   </View>
                   
                   <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stats.profitFactor > 1.5 ? colors.profit : stats.profitFactor > 1 ? '#FBBF24' : colors.loss }} />
                          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>
                             {stats.profitFactor > 1.5 ? 'Excellent' : stats.profitFactor > 1 ? 'Good' : 'Needs Work'}
                          </Text>
                      </View>
                   </View>
                </View>
              </View>
            </View>
            
            {/* Performance Extremes */}
            <View style={{ paddingHorizontal: scale(20) }}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(17), color: themeColors.text, marginBottom: scale(12) }}>Performance Extremes</Text>
              
              {bestMonth && (
                <View style={{ backgroundColor: themeColors.card, borderRadius: scale(16), padding: scale(16), marginBottom: scale(12), borderWidth: 1, borderColor: themeColors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LinearGradient
                      colors={['#10B95F', '#059669']}
                      style={{ width: scale(48), height: scale(48), borderRadius: scale(14), justifyContent: 'center', alignItems: 'center', marginRight: scale(14) }}
                    >
                      <Ionicons name="trophy" size={scale(24)} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>Best Month</Text>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(16), color: themeColors.text }}>{formatMonthDisplay(bestMonth.month)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: colors.profit }}>{formatCurrency(bestMonth.netProfitLoss)}</Text>
                      <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: themeColors.textMuted }}>+{bestMonth.returnPercentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                </View>
              )}
              
              {worstMonth && (
                <View style={{ backgroundColor: themeColors.card, borderRadius: scale(16), padding: scale(16), borderWidth: 1, borderColor: themeColors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      style={{ width: scale(48), height: scale(48), borderRadius: scale(14), justifyContent: 'center', alignItems: 'center', marginRight: scale(14) }}
                    >
                      <Ionicons name="trending-down" size={scale(24)} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>Worst Month</Text>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(16), color: themeColors.text }}>{formatMonthDisplay(worstMonth.month)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: colors.loss }}>{formatCurrency(worstMonth.netProfitLoss)}</Text>
                      <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: themeColors.textMuted }}>{worstMonth.returnPercentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
