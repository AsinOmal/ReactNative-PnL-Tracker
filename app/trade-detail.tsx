import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../src/config/fonts';
import { useTheme } from '../src/context/ThemeContext';
import { useTrading } from '../src/context/TradingContext';
import { fontScale, scale } from '../src/utils/scaling';

export default function TradeDetailScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTradeById, deleteTrade } = useTrading();
  
  const trade = getTradeById(id || '');
  
  const themeColors = {
    bg: isDark ? '#09090B' : '#FFFFFF',
    card: isDark ? '#18181B' : '#F4F4F5',
    cardBorder: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#FFFFFF' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  if (!trade) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(16), color: themeColors.textMuted }}>
          Trade not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: scale(16) }}>
          <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(14), color: '#10B95F' }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Trade',
      `Are you sure you want to delete this ${trade.symbol} trade?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrade(trade.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete trade');
            }
          },
        },
      ]
    );
  };
  
  const DetailRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: scale(12), borderBottomWidth: 1, borderBottomColor: themeColors.cardBorder }}>
      <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.textMuted }}>
        {label}
      </Text>
      <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(15), color: valueColor || themeColors.text }}>
        {value}
      </Text>
    </View>
  );
  
  const isWin = trade.pnl > 0;
  const isLoss = trade.pnl < 0;
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: themeColors.cardBorder,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: scale(4) }}>
          <Ionicons name="arrow-back" size={scale(24)} color={themeColors.text} />
        </TouchableOpacity>
        
        <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: themeColors.text }}>
          Trade Details
        </Text>
        
        <TouchableOpacity onPress={handleDelete} style={{ padding: scale(4) }}>
          <Ionicons name="trash-outline" size={scale(22)} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: scale(20) }}>
        {/* Symbol & Type Header */}
        <View style={{ alignItems: 'center', marginBottom: scale(24) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12), marginBottom: scale(12) }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(32), color: themeColors.text }}>
              {trade.symbol}
            </Text>
            <View style={{
              paddingHorizontal: scale(12),
              paddingVertical: scale(4),
              borderRadius: scale(8),
              backgroundColor: trade.tradeType === 'long' ? 'rgba(16, 185, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            }}>
              <Text style={{
                fontFamily: fonts.bold,
                fontSize: fontScale(12),
                color: trade.tradeType === 'long' ? '#10B95F' : '#EF4444',
                textTransform: 'uppercase',
              }}>
                {trade.tradeType}
              </Text>
            </View>
          </View>
          
          {/* P&L Display */}
          <Text style={{
            fontFamily: fonts.bold,
            fontSize: fontScale(40),
            color: isWin ? '#10B95F' : isLoss ? '#EF4444' : themeColors.text,
          }}>
            {formatCurrency(trade.pnl)}
          </Text>
          <Text style={{
            fontFamily: fonts.medium,
            fontSize: fontScale(18),
            color: isWin ? '#10B95F' : isLoss ? '#EF4444' : themeColors.textMuted,
          }}>
            {trade.returnPercentage >= 0 ? '+' : ''}{trade.returnPercentage.toFixed(2)}%
          </Text>
        </View>
        
        {/* Details Card */}
        <View style={{
          backgroundColor: themeColors.card,
          borderRadius: scale(16),
          padding: scale(16),
          marginBottom: scale(20),
          borderWidth: 1,
          borderColor: themeColors.cardBorder,
        }}>
          <DetailRow label="Entry Date" value={formatDate(trade.entryDate)} />
          <DetailRow label="Exit Date" value={formatDate(trade.exitDate)} />
          <DetailRow label="Entry Price" value={`$${trade.entryPrice.toFixed(2)}`} />
          <DetailRow label="Exit Price" value={`$${trade.exitPrice.toFixed(2)}`} />
          <DetailRow label="Quantity" value={trade.quantity.toString()} />
          <DetailRow label="Month" value={trade.monthKey} />
          <DetailRow 
            label="Result" 
            value={isWin ? 'Win' : isLoss ? 'Loss' : 'Break Even'}
            valueColor={isWin ? '#10B95F' : isLoss ? '#EF4444' : themeColors.text}
          />
        </View>
        
        {/* Tags */}
        {trade.tags.length > 0 && (
          <View style={{ marginBottom: scale(20) }}>
            <Text style={{
              fontFamily: fonts.semiBold,
              fontSize: fontScale(14),
              color: themeColors.textMuted,
              marginBottom: scale(12),
            }}>
              Tags
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: scale(8) }}>
              {trade.tags.map((tag, idx) => (
                <View key={idx} style={{
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(6),
                  borderRadius: scale(8),
                  backgroundColor: isDark ? 'rgba(113, 113, 122, 0.2)' : 'rgba(161, 161, 170, 0.2)',
                }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Notes */}
        {trade.notes && (
          <View style={{ marginBottom: scale(20) }}>
            <Text style={{
              fontFamily: fonts.semiBold,
              fontSize: fontScale(14),
              color: themeColors.textMuted,
              marginBottom: scale(12),
            }}>
              Notes
            </Text>
            <View style={{
              backgroundColor: themeColors.card,
              borderRadius: scale(12),
              padding: scale(16),
              borderWidth: 1,
              borderColor: themeColors.cardBorder,
            }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.text, lineHeight: fontScale(22) }}>
                {trade.notes}
              </Text>
            </View>
          </View>
        )}
        
        {/* Timestamps */}
        <View style={{ alignItems: 'center', paddingTop: scale(16) }}>
          <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(12), color: themeColors.textMuted }}>
            Created: {new Date(trade.createdAt).toLocaleString()}
          </Text>
          {trade.updatedAt !== trade.createdAt && (
            <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(12), color: themeColors.textMuted, marginTop: scale(4) }}>
              Updated: {new Date(trade.updatedAt).toLocaleString()}
            </Text>
          )}
        </View>
        
        <View style={{ height: scale(40) }} />
      </ScrollView>
    </SafeAreaView>
  );
}
