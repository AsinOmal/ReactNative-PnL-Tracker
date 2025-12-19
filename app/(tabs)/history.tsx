import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrivacyAwareText } from '../../src/components/PrivacyAwareText';
import { fonts } from '../../src/config/fonts';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import { formatMonthDisplay, sortMonthsDesc } from '../../src/utils/dateUtils';
import { fontScale, scale } from '../../src/utils/scaling';

type FilterType = 'all' | 'profit' | 'loss';

export default function HistoryScreen() {
  const router = useRouter();
  const { months, deleteMonth, loadMonths } = useTrading();
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Keep track of open swipeables to close them when others open
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

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

  const handleDelete = (id: string, monthName: string) => {
    // Close the swipeable row if it exists
    const ref = swipeableRefs.current.get(id);
    if (ref) ref.close();

    Alert.alert(
      'Delete Month',
      `Are you sure you want to delete the record for ${monthName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMonth(id);
            } catch (error) {
              console.error('Failed to delete month', error);
              Alert.alert('Error', 'Failed to delete month');
            }
          }
        },
      ]
    );
  };
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
    border: isDark ? '#27272A' : '#E4E4E7',
  };
  
  const colors = {
    profit: '#10B95F',
    loss: '#EF4444',
    profitLight: 'rgba(16, 185, 95, 0.15)',
    lossLight: 'rgba(239, 68, 68, 0.15)',
  };
  
  // Filter and sort months
  const filteredMonths = [...months]
    .filter(m => {
      if (filter === 'profit') return m.netProfitLoss > 0;
      if (filter === 'loss') return m.netProfitLoss < 0;
      return true;
    })
    .sort((a, b) => sortMonthsDesc(a.month, b.month));
  
  // Group months by year
  const groupedByYear = filteredMonths.reduce<Record<string, typeof filteredMonths>>((groups, month) => {
    const year = month.month.split('-')[0];
    if (!groups[year]) groups[year] = [];
    groups[year].push(month);
    return groups;
  }, {});
  
  const years = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));
  
  // Calculate stats
  const totalProfit = months.reduce((sum, m) => sum + (m.netProfitLoss > 0 ? m.netProfitLoss : 0), 0);
  const totalLoss = months.reduce((sum, m) => sum + (m.netProfitLoss < 0 ? Math.abs(m.netProfitLoss) : 0), 0);
  const profitCount = months.filter(m => m.netProfitLoss > 0).length;
  const lossCount = months.filter(m => m.netProfitLoss < 0).length;
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };
  
  const FilterButton = ({ type, label }: { type: FilterType; label: string }) => (
    <TouchableOpacity
      onPress={() => setFilter(type)}
      style={{
        paddingHorizontal: scale(16),
        paddingVertical: scale(10),
        borderRadius: scale(12),
        backgroundColor: filter === type 
          ? (type === 'profit' ? colors.profitLight : type === 'loss' ? colors.lossLight : 'rgba(99, 102, 241, 0.15)')
          : 'transparent',
        borderWidth: 1,
        borderColor: filter === type 
          ? (type === 'profit' ? colors.profit : type === 'loss' ? colors.loss : '#6366F1')
          : themeColors.border,
      }}
    >
      <Text style={{ 
        fontFamily: fonts.semiBold, 
        fontSize: fontScale(13), 
        color: filter === type 
          ? (type === 'profit' ? colors.profit : type === 'loss' ? colors.loss : '#6366F1')
          : themeColors.textMuted 
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRightActions = (id: string, monthName: string) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#EF4444',
          justifyContent: 'center',
          alignItems: 'center',
          width: scale(80),
          marginBottom: scale(10),
          marginRight: scale(20), // Add margin to match card margin
          borderTopRightRadius: scale(16),
          borderBottomRightRadius: scale(16),
        }}
        onPress={() => handleDelete(id, monthName)}
      >
        <Ionicons name="trash-outline" size={scale(24)} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: scale(20), paddingTop: scale(16), paddingBottom: scale(16) }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(32), color: themeColors.text }}>History</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.textMuted, marginTop: scale(4) }}>
          {months.length} months recorded
        </Text>
      </View>
      
      {/* Stats Cards */}
      <View style={{ flexDirection: 'row', paddingHorizontal: scale(20), gap: scale(12), marginBottom: scale(16) }}>
        <LinearGradient
          colors={isDark ? ['#1a5d3a', '#0f3522'] : ['#10B95F', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            flex: 1, 
            borderRadius: scale(24), 
            padding: scale(20),
            shadowColor: '#10B95F',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 25,
            elevation: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(16, 185, 95, 0.5)' : 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Decorative shine */}
          <View style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: scale(12) }}>
            <View style={{ 
              width: scale(36), height: scale(36), borderRadius: scale(12), 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
            }}>
              <Ionicons name="trending-up" size={scale(20)} color="#FFFFFF" />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(14), color: '#FFFFFF', opacity: 0.9 }}>Total Gain</Text>
          </View>
          <PrivacyAwareText value={totalProfit} format={(val) => formatCurrency(val)} style={{ fontFamily: fonts.extraBold, fontSize: fontScale(28), color: '#FFFFFF' }} maskedValue="••••••" numberOfLines={1} adjustsFontSizeToFit />
          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: 'rgba(255,255,255,0.7)', marginTop: scale(8) }}>{profitCount} winning months</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={isDark ? ['#5c1c1c', '#360f0f'] : ['#EF4444', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            flex: 1, 
            borderRadius: scale(24), 
            padding: scale(20),
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 25,
            elevation: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Decorative shine */}
          <View style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: scale(12) }}>
            <View style={{ 
              width: scale(36), height: scale(36), borderRadius: scale(12), 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
            }}>
              <Ionicons name="trending-down" size={scale(20)} color="#FFFFFF" />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(14), color: '#FFFFFF', opacity: 0.9 }}>Total Loss</Text>
          </View>
          <PrivacyAwareText value={totalLoss} format={(val) => `-${formatCurrency(val)}`} style={{ fontFamily: fonts.extraBold, fontSize: fontScale(28), color: '#FFFFFF' }} maskedValue="-••••••" numberOfLines={1} adjustsFontSizeToFit />
          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: 'rgba(255,255,255,0.7)', marginTop: scale(8) }}>{lossCount} losing months</Text>
        </LinearGradient>
      </View>
      
      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: scale(20), gap: scale(8), marginBottom: scale(20) }}>
        <FilterButton type="all" label="All" />
        <FilterButton type="profit" label="Winning" />
        <FilterButton type="loss" label="Losing" />
      </View>
      
      {months.length === 0 ? (
        <View style={{ flex: 1, paddingHorizontal: scale(20), paddingTop: scale(20) }}>
          <View style={{ flexDirection: 'row', height: '100%' }}>
            {/* Timeline Line */}
            <View style={{ width: 2, backgroundColor: themeColors.border, marginRight: scale(24), marginLeft: scale(10), height: '80%', opacity: 0.5 }}>
              <View style={{ 
                width: scale(12), height: scale(12), borderRadius: scale(6), 
                backgroundColor: '#10B95F', 
                position: 'absolute', top: 0, left: -scale(5),
                shadowColor: '#10B95F', shadowOffset: {width: 0, height: 0}, shadowRadius: 8, shadowOpacity: 0.8, elevation: 8
              }} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ marginBottom: scale(32) }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(20), color: themeColors.text, marginBottom: scale(4) }}> 
                  Your Journey Begins
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: themeColors.textMuted, lineHeight: fontScale(20) }}>
                  Your trading timeline is a blank canvas. Start filling it with your wins and lessons.
                </Text>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/add-month')}
                style={{
                  borderRadius: scale(20),
                  borderWidth: 1,
                  borderColor: '#10B95F',
                  borderStyle: 'dashed',
                  backgroundColor: isDark ? 'rgba(16, 185, 95, 0.05)' : 'rgba(16, 185, 95, 0.02)',
                  padding: scale(24),
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: scale(12)
                }}
              >
                <View style={{ 
                  width: scale(48), height: scale(48), borderRadius: scale(24), 
                  backgroundColor: 'rgba(16, 185, 95, 0.1)', 
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(16, 185, 95, 0.2)'
                }}>
                  <Ionicons name="add" size={scale(24)} color="#10B95F" />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(16), color: '#10B95F' }}>Log First Month</Text>
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: themeColors.textMuted, marginTop: scale(4) }}>Kickstart your history</Text>
                </View>
              </TouchableOpacity>
              
              {/* Ghost Items for immersion */}
              <View style={{ marginTop: scale(24), opacity: 0.3 }}>
                 <View style={{ height: scale(80), borderRadius: scale(16), backgroundColor: themeColors.card, marginBottom: scale(12) }} />
                 <View style={{ height: scale(80), borderRadius: scale(16), backgroundColor: themeColors.card }} />
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* Months List Grouped by Year */
        <FlatList
          data={years}
          keyExtractor={(year) => year}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.text} />
          }
          renderItem={({ item: year }) => (
            <View style={{ marginBottom: scale(24) }}>
              {/* Year Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(20), marginBottom: scale(12), gap: scale(12) }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: themeColors.text }}>{year}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: themeColors.border }} />
                <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>
                  {groupedByYear[year].length} months
                </Text>
              </View>
              
              {/* Month Cards */}
              {groupedByYear[year].map((month) => (
                <Swipeable
                  key={month.id}
                  ref={(ref) => {
                    if (ref) swipeableRefs.current.set(month.id, ref);
                    else swipeableRefs.current.delete(month.id);
                  }}
                  renderRightActions={() => renderRightActions(month.id, formatMonthDisplay(month.month))}
                  onSwipeableWillOpen={() => {
                      // Optional: Close other swipeables when one opens
                      swipeableRefs.current.forEach((ref, key) => {
                          if (key !== month.id) ref.close();
                      });
                  }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/month-details/${month.id}`)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginHorizontal: scale(20),
                      marginBottom: scale(10),
                      borderRadius: scale(16),
                      backgroundColor: themeColors.card,
                      padding: scale(16),
                      borderWidth: 1,
                      borderColor: themeColors.border,
                    }}
                  >
                      {/* Profit/Loss Icon */}
                      <View style={{ 
                        width: scale(40), 
                        height: scale(40), 
                        borderRadius: scale(12), 
                        backgroundColor: month.netProfitLoss >= 0 ? 'rgba(16, 185, 95, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        marginRight: scale(14) 
                      }}>
                        <Ionicons 
                          name={month.netProfitLoss >= 0 ? 'trending-up' : 'trending-down'} 
                          size={scale(20)} 
                          color={month.netProfitLoss >= 0 ? colors.profit : colors.loss} 
                        />
                      </View>
                      
                      {/* Month Details */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(16), color: themeColors.text }}>
                          {formatMonthDisplay(month.month)}
                        </Text>
                        <View style={{ 
                          marginTop: scale(4),
                          paddingHorizontal: scale(6), 
                          paddingVertical: scale(2), 
                          borderRadius: scale(4), 
                          backgroundColor: month.status === 'closed' ? '#4F46E5' : '#F59E0B',
                          alignSelf: 'flex-start'
                        }}>
                          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(9), color: '#FFFFFF' }}>
                            {month.status === 'closed' ? 'Closed' : 'Active'}
                          </Text>
                        </View>
                      </View>
                      
                      {/* P&L Amount with Return % below */}
                      <View style={{ alignItems: 'flex-end' }}>
                        <PrivacyAwareText 
                          value={month.netProfitLoss} 
                          format={(val: number) => `${val >= 0 ? '+' : ''}${formatCurrency(val)}`} 
                          style={{ fontFamily: fonts.bold, fontSize: fontScale(17), color: month.netProfitLoss >= 0 ? colors.profit : colors.loss }} 
                          maskedValue="••••••"
                        />
                        <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: themeColors.textMuted, marginTop: scale(2) }}>
                          {month.returnPercentage >= 0 ? '+' : ''}{month.returnPercentage.toFixed(1)}%
                        </Text>
                      </View>
                      
                      {/* Arrow */}
                      <Ionicons name="chevron-forward" size={scale(18)} color={themeColors.textMuted} style={{ marginLeft: scale(10) }} />
                  </TouchableOpacity>
                </Swipeable>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: scale(140) }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: scale(60), paddingHorizontal: scale(40) }}>
              <Ionicons name="search" size={scale(48)} color={themeColors.textMuted} style={{ marginBottom: scale(16) }} />
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(18), color: themeColors.text, marginBottom: scale(8), textAlign: 'center' }}>
                No {filter === 'profit' ? 'winning' : 'losing'} months
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: themeColors.textMuted, textAlign: 'center' }}>
                Try changing the filter
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
