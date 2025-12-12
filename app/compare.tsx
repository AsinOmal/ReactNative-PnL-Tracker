import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../src/config/fonts';
import { colors } from '../src/config/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useTrading } from '../src/context/TradingContext';
import { MonthRecord } from '../src/types';
import { formatMonthDisplay } from '../src/utils/dateUtils';
import { formatCurrency, formatPercentage } from '../src/utils/formatters';
import { fontScale, scale } from '../src/utils/scaling';

export default function CompareScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { months } = useTrading();
  
  const [selectedMonth1, setSelectedMonth1] = useState<MonthRecord | null>(null);
  const [selectedMonth2, setSelectedMonth2] = useState<MonthRecord | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickingFor, setPickingFor] = useState<1 | 2>(1);
  
  const closedMonths = months.filter(m => m.status === 'closed');
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    border: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  const handleOpenPicker = (forMonth: 1 | 2) => {
    setPickingFor(forMonth);
    setShowPicker(true);
  };
  
  const handleSelectMonth = (month: MonthRecord) => {
    if (pickingFor === 1) {
      setSelectedMonth1(month);
    } else {
      setSelectedMonth2(month);
    }
    setShowPicker(false);
  };
  
  const getWinner = () => {
    if (!selectedMonth1 || !selectedMonth2) return null;
    if (selectedMonth1.netProfitLoss > selectedMonth2.netProfitLoss) return 1;
    if (selectedMonth2.netProfitLoss > selectedMonth1.netProfitLoss) return 2;
    return 0; // tie
  };
  
  const winner = getWinner();
  
  const ComparisonRow = ({ 
    label, 
    value1, 
    value2, 
    formatFn, 
    icon,
    iconColor 
  }: { 
    label: string; 
    value1: number; 
    value2: number; 
    formatFn: (v: number) => string;
    icon: string;
    iconColor: string;
  }) => {
    const diff = value1 - value2;
    const winner1 = value1 > value2;
    const winner2 = value2 > value1;
    
    return (
      <View style={[styles.comparisonRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.rowHeader}>
          <View style={[styles.rowIconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon as any} size={scale(14)} color={iconColor} />
          </View>
          <Text style={[styles.rowLabel, { color: themeColors.textMuted }]}>{label}</Text>
        </View>
        
        <View style={styles.rowValues}>
          {/* Left Value */}
          <View style={styles.valueBox}>
            {winner1 && <Ionicons name="trophy" size={scale(11)} color={colors.profit} style={{ marginRight: scale(4) }} />}
            <Text style={[styles.value, { color: winner1 ? colors.profit : winner2 ? colors.loss : themeColors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {formatFn(value1)}
            </Text>
          </View>
          
          {/* Diff Badge (centered) */}
          <View style={styles.diffBadgeWrapper}>
            <View style={[styles.diffBadge, { backgroundColor: diff >= 0 ? 'rgba(16,185,95,0.15)' : 'rgba(239,68,68,0.15)' }]}>
              <Text style={[styles.diffText, { color: diff >= 0 ? colors.profit : colors.loss }]} numberOfLines={1}>
                {formatFn(diff)}
              </Text>
            </View>
          </View>
          
          {/* Right Value */}
          <View style={[styles.valueBox, { justifyContent: 'flex-end' }]}>
            {winner2 && <Ionicons name="trophy" size={scale(11)} color={colors.profit} style={{ marginRight: scale(4) }} />}
            <Text style={[styles.value, { color: winner2 ? colors.profit : winner1 ? colors.loss : themeColors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {formatFn(value2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={scale(22)} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Compare Months</Text>
        <View style={{ width: scale(40) }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: scale(40) }}>
        {/* Month Selector Cards */}
        <View style={styles.selectorsContainer}>
          {/* Month 1 */}
          <TouchableOpacity 
            style={[
              styles.selectorCard, 
              { 
                backgroundColor: themeColors.card, 
                borderColor: selectedMonth1 ? (winner === 1 ? colors.profit : winner === 2 ? colors.loss : themeColors.border) : themeColors.border,
                borderWidth: selectedMonth1 && winner !== 0 ? 2 : 1,
              }
            ]}
            onPress={() => handleOpenPicker(1)}
            activeOpacity={0.7}
          >
            {selectedMonth1 ? (
              <>
                {/* Winner badge (trophy only) or placeholder for consistent height */}
                {winner === 1 ? (
                  <View style={styles.winnerBadge}>
                    <Ionicons name="trophy" size={scale(16)} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.badgePlaceholder} />
                )}
                <Text style={[styles.selectorMonth, { color: themeColors.text }]} numberOfLines={1}>
                  {formatMonthDisplay(selectedMonth1.month)}
                </Text>
                <Text style={[styles.selectorPnL, { color: winner === 2 ? colors.loss : winner === 1 ? colors.profit : (selectedMonth1.netProfitLoss >= 0 ? colors.profit : colors.loss) }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {formatCurrency(selectedMonth1.netProfitLoss, true)}
                </Text>
                <Text style={[styles.selectorReturn, { color: themeColors.textMuted }]} numberOfLines={1}>
                  {formatPercentage(selectedMonth1.returnPercentage, true)} return
                </Text>
              </>
            ) : (
              <View style={styles.selectorEmpty}>
                <View style={[styles.selectorEmptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="add" size={scale(24)} color={themeColors.textMuted} />
                </View>
                <Text style={[styles.selectorPlaceholder, { color: themeColors.textMuted }]}>Select Month</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* VS Badge Container */}
          <View style={styles.vsBadgeContainer}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.vsBadge}
            >
              <Ionicons name="git-compare" size={scale(16)} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Month 2 */}
          <TouchableOpacity 
            style={[
              styles.selectorCard, 
              { 
                backgroundColor: themeColors.card, 
                borderColor: selectedMonth2 ? (winner === 2 ? colors.profit : winner === 1 ? colors.loss : themeColors.border) : themeColors.border,
                borderWidth: selectedMonth2 && winner !== 0 ? 2 : 1,
              }
            ]}
            onPress={() => handleOpenPicker(2)}
            activeOpacity={0.7}
          >
            {selectedMonth2 ? (
              <>
                {/* Winner badge (trophy only) or placeholder for consistent height */}
                {winner === 2 ? (
                  <View style={styles.winnerBadge}>
                    <Ionicons name="trophy" size={scale(16)} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.badgePlaceholder} />
                )}
                <Text style={[styles.selectorMonth, { color: themeColors.text }]} numberOfLines={1}>
                  {formatMonthDisplay(selectedMonth2.month)}
                </Text>
                <Text style={[styles.selectorPnL, { color: winner === 1 ? colors.loss : winner === 2 ? colors.profit : (selectedMonth2.netProfitLoss >= 0 ? colors.profit : colors.loss) }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {formatCurrency(selectedMonth2.netProfitLoss, true)}
                </Text>
                <Text style={[styles.selectorReturn, { color: themeColors.textMuted }]} numberOfLines={1}>
                  {formatPercentage(selectedMonth2.returnPercentage, true)} return
                </Text>
              </>
            ) : (
              <View style={styles.selectorEmpty}>
                <View style={[styles.selectorEmptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="add" size={scale(24)} color={themeColors.textMuted} />
                </View>
                <Text style={[styles.selectorPlaceholder, { color: themeColors.textMuted }]}>Select Month</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Comparison Results */}
        {selectedMonth1 && selectedMonth2 && (
          <View style={styles.comparisonSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={scale(16)} color={themeColors.textMuted} />
              <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>Comparison</Text>
            </View>
            
            <ComparisonRow 
              label="Net P&L"
              value1={selectedMonth1.netProfitLoss}
              value2={selectedMonth2.netProfitLoss}
              formatFn={(v) => formatCurrency(v, true)}
              icon="trending-up"
              iconColor="#10B95F"
            />
            
            <ComparisonRow 
              label="Return %"
              value1={selectedMonth1.returnPercentage}
              value2={selectedMonth2.returnPercentage}
              formatFn={(v) => formatPercentage(v, true)}
              icon="stats-chart"
              iconColor="#6366F1"
            />
            
            <ComparisonRow 
              label="Starting Capital"
              value1={selectedMonth1.startingCapital}
              value2={selectedMonth2.startingCapital}
              formatFn={(v) => formatCurrency(v)}
              icon="wallet"
              iconColor="#F59E0B"
            />
            
            <ComparisonRow 
              label="Ending Capital"
              value1={selectedMonth1.endingCapital}
              value2={selectedMonth2.endingCapital}
              formatFn={(v) => formatCurrency(v)}
              icon="cash"
              iconColor="#3B82F6"
            />
          </View>
        )}

        {/* Empty State */}
        {(!selectedMonth1 || !selectedMonth2) && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}>
              <Ionicons name="git-compare" size={scale(32)} color="#6366F1" />
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Select Two Months</Text>
            <Text style={[styles.emptyMessage, { color: themeColors.textMuted }]}>
              Tap the cards above to select months for comparison
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Select Month {pickingFor}
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close-circle" size={scale(28)} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {closedMonths.length === 0 ? (
                <Text style={[styles.noMonthsText, { color: themeColors.textMuted }]}>
                  No closed months available
                </Text>
              ) : (
                closedMonths.map((month) => {
                  const isSelected = 
                    (pickingFor === 1 && selectedMonth1?.id === month.id) ||
                    (pickingFor === 2 && selectedMonth2?.id === month.id);
                  const isDisabled = 
                    (pickingFor === 1 && selectedMonth2?.id === month.id) ||
                    (pickingFor === 2 && selectedMonth1?.id === month.id);
                  
                  return (
                    <TouchableOpacity
                      key={month.id}
                      style={[
                        styles.monthOption, 
                        { 
                          backgroundColor: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                          opacity: isDisabled ? 0.4 : 1,
                        }
                      ]}
                      onPress={() => !isDisabled && handleSelectMonth(month)}
                      disabled={isDisabled}
                    >
                      <View>
                        <Text style={[styles.monthOptionText, { color: themeColors.text }]}>
                          {formatMonthDisplay(month.month)}
                        </Text>
                        <Text style={[styles.monthOptionSub, { color: themeColors.textMuted }]}>
                          {formatPercentage(month.returnPercentage, true)} return
                        </Text>
                      </View>
                      <Text style={[styles.monthOptionPnL, { color: month.netProfitLoss >= 0 ? colors.profit : colors.loss }]}>
                        {formatCurrency(month.netProfitLoss, true)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontScale(20),
  },
  selectorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    gap: scale(12),
    marginBottom: scale(24),
  },
  selectorCard: {
    flex: 1,
    borderRadius: scale(20),
    padding: scale(16),
    alignItems: 'center',
    minHeight: scale(140),
    justifyContent: 'center',
  },
  selectorMonth: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(14),
    marginBottom: scale(4),
  },
  selectorPnL: {
    fontFamily: fonts.bold,
    fontSize: fontScale(18),
    marginBottom: scale(4),
  },
  selectorReturn: {
    fontFamily: fonts.medium,
    fontSize: fontScale(12),
  },
  selectorEmpty: {
    alignItems: 'center',
  },
  selectorEmptyIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  selectorPlaceholder: {
    fontFamily: fonts.medium,
    fontSize: fontScale(14),
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#10B95F',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginBottom: scale(8),
  },
  winnerBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(10),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: colors.loss,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginBottom: scale(8),
  },
  loserBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(10),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgePlaceholder: {
    height: scale(22),
    marginBottom: scale(8),
  },
  vsBadgeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  vsBadge: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonSection: {
    paddingHorizontal: scale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(16),
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(12),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  comparisonRow: {
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(12),
    borderWidth: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: scale(12),
  },
  rowIconContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerBox: {
    // Additional styling for winner
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: fontScale(13),
  },
  diffBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(4),
  },
  diffBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(10),
    minWidth: scale(70),
    alignItems: 'center',
  },
  diffText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(10),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: scale(60),
    paddingHorizontal: scale(40),
  },
  emptyIcon: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(18),
    marginBottom: scale(8),
  },
  emptyMessage: {
    fontFamily: fonts.regular,
    fontSize: fontScale(14),
    textAlign: 'center',
    lineHeight: fontScale(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingTop: scale(20),
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    marginBottom: scale(16),
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: fontScale(18),
  },
  modalScroll: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(40),
  },
  monthOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    marginBottom: scale(8),
  },
  monthOptionText: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(16),
  },
  monthOptionSub: {
    fontFamily: fonts.regular,
    fontSize: fontScale(12),
    marginTop: scale(2),
  },
  monthOptionPnL: {
    fontFamily: fonts.bold,
    fontSize: fontScale(18),
  },
  noMonthsText: {
    fontFamily: fonts.medium,
    fontSize: fontScale(14),
    textAlign: 'center',
    paddingVertical: scale(40),
  },
});
