import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../src/config/fonts';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import { Trade } from '../../src/types';
import { fontScale, scale } from '../../src/utils/scaling';

type FilterType = 'all' | 'wins' | 'losses';

export default function TradesScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { trades, tradeStats, isLoadingTrades } = useTrading();
  const [filter, setFilter] = useState<FilterType>('all');
  
  const themeColors = {
    bg: isDark ? '#09090B' : '#FFFFFF',
    card: isDark ? '#18181B' : '#F4F4F5',
    cardBorder: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#FFFFFF' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  // Filter trades
  const filteredTrades = trades.filter(trade => {
    if (filter === 'wins') return trade.pnl > 0;
    if (filter === 'losses') return trade.pnl < 0;
    return true;
  });
  
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Render streak badge (only show if 3+ consecutive)
  const renderStreakBadge = () => {
    const streak = tradeStats.currentStreak;
    const count = Math.abs(streak);
    
    // Only show streak badge if 3 or more consecutive wins/losses
    if (count < 3) return null;
    
    const isWin = streak > 0;
    
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        backgroundColor: isWin ? 'rgba(16, 185, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        gap: scale(4),
      }}>
        <Ionicons 
          name={isWin ? 'flame' : 'snow'} 
          size={scale(14)} 
          color={isWin ? '#10B95F' : '#EF4444'} 
        />
        <Text style={{
          fontFamily: fonts.semiBold,
          fontSize: fontScale(12),
          color: isWin ? '#10B95F' : '#EF4444',
        }}>
          {count} {isWin ? 'Win' : 'Loss'} Streak
        </Text>
      </View>
    );
  };
  
  // Render trade card
  const renderTradeCard = ({ item }: { item: Trade }) => {
    const isWin = item.pnl > 0;
    const isLoss = item.pnl < 0;
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/trade-detail?id=${item.id}`)}
        style={{
          backgroundColor: themeColors.card,
          borderRadius: scale(16),
          padding: scale(16),
          marginBottom: scale(12),
          borderWidth: 1,
          borderColor: themeColors.cardBorder,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: Symbol & Type */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
              <Text style={{
                fontFamily: fonts.bold,
                fontSize: fontScale(18),
                color: themeColors.text,
              }}>
                {item.symbol}
              </Text>
              <View style={{
                paddingHorizontal: scale(8),
                paddingVertical: scale(2),
                borderRadius: scale(6),
                backgroundColor: item.tradeType === 'long' ? 'rgba(16, 185, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              }}>
                <Text style={{
                  fontFamily: fonts.medium,
                  fontSize: fontScale(10),
                  color: item.tradeType === 'long' ? '#10B95F' : '#EF4444',
                  textTransform: 'uppercase',
                }}>
                  {item.tradeType}
                </Text>
              </View>
            </View>
            
            <Text style={{
              fontFamily: fonts.regular,
              fontSize: fontScale(13),
              color: themeColors.textMuted,
              marginTop: scale(4),
            }}>
              {formatDate(item.entryDate)} → {formatDate(item.exitDate)}
            </Text>
            
            <Text style={{
              fontFamily: fonts.regular,
              fontSize: fontScale(12),
              color: themeColors.textMuted,
              marginTop: scale(2),
            }}>
              ${item.entryPrice.toFixed(2)} → ${item.exitPrice.toFixed(2)} × {item.quantity}
            </Text>
          </View>
          
          {/* Right: P&L */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{
              fontFamily: fonts.bold,
              fontSize: fontScale(18),
              color: isWin ? '#10B95F' : isLoss ? '#EF4444' : themeColors.text,
            }}>
              {formatCurrency(item.pnl)}
            </Text>
            <Text style={{
              fontFamily: fonts.medium,
              fontSize: fontScale(12),
              color: isWin ? '#10B95F' : isLoss ? '#EF4444' : themeColors.textMuted,
            }}>
              {item.returnPercentage >= 0 ? '+' : ''}{item.returnPercentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: scale(6), marginTop: scale(10) }}>
            {item.tags.map((tag, idx) => (
              <View key={idx} style={{
                paddingHorizontal: scale(8),
                paddingVertical: scale(3),
                borderRadius: scale(6),
                backgroundColor: isDark ? 'rgba(113, 113, 122, 0.2)' : 'rgba(161, 161, 170, 0.2)',
              }}>
                <Text style={{
                  fontFamily: fonts.medium,
                  fontSize: fontScale(11),
                  color: themeColors.textMuted,
                }}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Empty state
  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(40) }}>
      <View style={{
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: 'rgba(16, 185, 95, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(24),
      }}>
        <Ionicons name="swap-horizontal" size={scale(36)} color="#10B95F" />
      </View>
      <Text style={{
        fontFamily: fonts.bold,
        fontSize: fontScale(22),
        color: themeColors.text,
        textAlign: 'center',
        marginBottom: scale(8),
      }}>
        No Trades Yet
      </Text>
      <Text style={{
        fontFamily: fonts.regular,
        fontSize: fontScale(15),
        color: themeColors.textMuted,
        textAlign: 'center',
        lineHeight: fontScale(22),
        marginBottom: scale(24),
      }}>
        Start logging your trades to track performance and see win/loss streaks.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/add-trade')}
        style={{
          backgroundColor: '#10B95F',
          paddingVertical: scale(14),
          paddingHorizontal: scale(28),
          borderRadius: scale(14),
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(8),
        }}
      >
        <Ionicons name="add" size={scale(20)} color="#FFFFFF" />
        <Text style={{
          fontFamily: fonts.bold,
          fontSize: fontScale(16),
          color: '#FFFFFF',
        }}>
          Add First Trade
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingTop: scale(8),
        paddingBottom: scale(16),
      }}>
        <Text style={{
          fontFamily: fonts.bold,
          fontSize: fontScale(32),
          color: themeColors.text,
        }}>
          Trades
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/add-trade')}
          style={{
            width: scale(44),
            height: scale(44),
            borderRadius: scale(14),
            backgroundColor: '#10B95F',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add" size={scale(24)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {isLoadingTrades ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#10B95F" />
        </View>
      ) : trades.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Stats Card */}
          <View style={{
            marginHorizontal: scale(20),
            marginBottom: scale(16),
            backgroundColor: themeColors.card,
            borderRadius: scale(16),
            padding: scale(16),
            borderWidth: 1,
            borderColor: themeColors.cardBorder,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(12) }}>
              <Text style={{
                fontFamily: fonts.semiBold,
                fontSize: fontScale(14),
                color: themeColors.textMuted,
              }}>
                Performance
              </Text>
              {renderStreakBadge()}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{
                  fontFamily: fonts.bold,
                  fontSize: fontScale(24),
                  color: tradeStats.totalPnL >= 0 ? '#10B95F' : '#EF4444',
                }}>
                  {formatCurrency(tradeStats.totalPnL)}
                </Text>
                <Text style={{
                  fontFamily: fonts.regular,
                  fontSize: fontScale(12),
                  color: themeColors.textMuted,
                }}>
                  Total P&L
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontFamily: fonts.bold,
                  fontSize: fontScale(24),
                  color: themeColors.text,
                }}>
                  {tradeStats.winRate.toFixed(0)}%
                </Text>
                <Text style={{
                  fontFamily: fonts.regular,
                  fontSize: fontScale(12),
                  color: themeColors.textMuted,
                }}>
                  Win Rate
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{
                  fontFamily: fonts.bold,
                  fontSize: fontScale(24),
                  color: themeColors.text,
                }}>
                  {tradeStats.totalTrades}
                </Text>
                <Text style={{
                  fontFamily: fonts.regular,
                  fontSize: fontScale(12),
                  color: themeColors.textMuted,
                }}>
                  Trades
                </Text>
              </View>
            </View>
          </View>
          
          {/* Filter Bar */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: scale(20),
            marginBottom: scale(16),
            gap: scale(8),
          }}>
            {(['all', 'wins', 'losses'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingVertical: scale(8),
                  paddingHorizontal: scale(16),
                  borderRadius: scale(20),
                  backgroundColor: filter === f 
                    ? (f === 'wins' ? 'rgba(16, 185, 95, 0.15)' : f === 'losses' ? 'rgba(239, 68, 68, 0.15)' : themeColors.card)
                    : 'transparent',
                  borderWidth: 1,
                  borderColor: filter === f ? 'transparent' : themeColors.cardBorder,
                }}
              >
                <Text style={{
                  fontFamily: fonts.medium,
                  fontSize: fontScale(13),
                  color: filter === f 
                    ? (f === 'wins' ? '#10B95F' : f === 'losses' ? '#EF4444' : themeColors.text)
                    : themeColors.textMuted,
                  textTransform: 'capitalize',
                }}>
                  {f} {f === 'wins' ? `(${tradeStats.winningTrades})` : f === 'losses' ? `(${tradeStats.losingTrades})` : `(${tradeStats.totalTrades})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Trade List */}
          <FlatList
            data={filteredTrades}
            renderItem={renderTradeCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: scale(20),
              paddingBottom: scale(120),
            }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}
