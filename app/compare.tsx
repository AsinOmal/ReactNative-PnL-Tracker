import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { colors } from '../src/config/theme';
import { useTrading } from '../src/context/TradingContext';
import { MonthRecord, Trade } from '../src/types';
import { formatMonthDisplay } from '../src/utils/dateUtils';
import { formatCurrency, formatPercentage } from '../src/utils/formatters';
import { fontScale, scale } from '../src/utils/scaling';

export default function CompareScreen() {
  const router = useRouter();
  const { months, trades } = useTrading();
  
  const [compareMode, setCompareMode] = useState<'months' | 'trades'>('months');
  
  const [selectedMonth1, setSelectedMonth1] = useState<MonthRecord | null>(null);
  const [selectedMonth2, setSelectedMonth2] = useState<MonthRecord | null>(null);
  
  const [selectedTrade1, setSelectedTrade1] = useState<Trade | null>(null);
  const [selectedTrade2, setSelectedTrade2] = useState<Trade | null>(null);
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickingFor, setPickingFor] = useState<1 | 2>(1);
  
  const closedMonths = months.filter(m => m.status === 'closed');
  const sortedTrades = [...trades].sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime());
  
  const handleOpenPicker = (forItem: 1 | 2) => {
    setPickingFor(forItem);
    setShowPicker(true);
  };
  
  const handleSelectMonth = (month: MonthRecord) => {
    if (pickingFor === 1) setSelectedMonth1(month);
    else setSelectedMonth2(month);
    setShowPicker(false);
  };
  
  const handleSelectTrade = (trade: Trade) => {
    if (pickingFor === 1) setSelectedTrade1(trade);
    else setSelectedTrade2(trade);
    setShowPicker(false);
  };
  
  const getWinner = () => {
    if (compareMode === 'months') {
        if (!selectedMonth1 || !selectedMonth2) return null;
        if (selectedMonth1.netProfitLoss > selectedMonth2.netProfitLoss) return 1;
        if (selectedMonth2.netProfitLoss > selectedMonth1.netProfitLoss) return 2;
        return 0;
    } else {
        if (!selectedTrade1 || !selectedTrade2) return null;
        if (selectedTrade1.pnl > selectedTrade2.pnl) return 1;
        if (selectedTrade2.pnl > selectedTrade1.pnl) return 2;
        return 0;
    }
  };
  
  const winner = getWinner();
  
  const hasSelections = compareMode === 'months' 
    ? (selectedMonth1 && selectedMonth2)
    : (selectedTrade1 && selectedTrade2);
    
  // Selector Card Component
  const SelectorCard = ({ slot }: { slot: 1 | 2 }) => {
    const isOne = slot === 1;
    const selectedItem = compareMode === 'months' 
        ? (isOne ? selectedMonth1 : selectedMonth2)
        : (isOne ? selectedTrade1 : selectedTrade2);
    
    const isWinner = winner === slot;
    
    return (
        <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: scale(20),
              padding: scale(16),
              alignItems: 'center',
              minHeight: scale(120),
              justifyContent: 'center',
              borderWidth: isWinner ? 2 : 0,
              borderColor: isWinner ? '#10B95F' : 'transparent',
            }}
            onPress={() => handleOpenPicker(slot)}
            activeOpacity={0.7}
        >
            {selectedItem ? (
              compareMode === 'months' ? (
                  <>
                     {isWinner && (
                        <View style={{ position: 'absolute', top: -scale(14), alignSelf: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: scale(12), paddingVertical: scale(6), borderRadius: scale(12), flexDirection: 'row', alignItems: 'center', gap: scale(4), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 }}>
                            <Ionicons name="trophy" size={scale(14)} color="#F59E0B" />
                            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(10), color: '#7C3AED' }}>WINNER</Text>
                        </View>
                     )}
                     <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(14), color: 'rgba(255,255,255,0.7)', marginBottom: scale(4), marginTop: isWinner ? scale(8) : 0 }}>
                        {formatMonthDisplay((selectedItem as MonthRecord).month)}
                     </Text>
                     <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(22), color: (selectedItem as MonthRecord).netProfitLoss >= 0 ? '#86EFAC' : '#FCA5A5' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {formatCurrency((selectedItem as MonthRecord).netProfitLoss, true)}
                     </Text>
                     <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: 'rgba(255,255,255,0.5)', marginTop: scale(4) }}>
                        {formatPercentage((selectedItem as MonthRecord).returnPercentage, true)}
                     </Text>
                  </>
              ) : (
                  <>
                     {isWinner && (
                        <View style={{ position: 'absolute', top: -scale(14), alignSelf: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: scale(12), paddingVertical: scale(6), borderRadius: scale(12), flexDirection: 'row', alignItems: 'center', gap: scale(4), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 }}>
                            <Ionicons name="trophy" size={scale(14)} color="#F59E0B" />
                            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(10), color: '#7C3AED' }}>WINNER</Text>
                        </View>
                     )}
                     <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(14), color: 'rgba(255,255,255,0.7)', marginBottom: scale(4), marginTop: isWinner ? scale(8) : 0 }}>
                        {(selectedItem as Trade).symbol}
                     </Text>
                     <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(22), color: (selectedItem as Trade).pnl >= 0 ? '#86EFAC' : '#FCA5A5' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {formatCurrency((selectedItem as Trade).pnl, true)}
                     </Text>
                     <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(11), color: 'rgba(255,255,255,0.5)', marginTop: scale(4), textTransform: 'uppercase' }}>
                        {(selectedItem as Trade).tradeType}
                     </Text>
                  </>
              )
            ) : (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: scale(44), height: scale(44), borderRadius: scale(22), backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: scale(8) }}>
                  <Ionicons name="add" size={scale(24)} color="rgba(255,255,255,0.5)" />
                </View>
                <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: 'rgba(255,255,255,0.5)' }}>
                    Select {compareMode === 'months' ? 'Month' : 'Trade'}
                </Text>
              </View>
            )}
        </TouchableOpacity>
    );
  };
  
  // Comparison Row Component
  const ComparisonRow = ({ 
    label, 
    value1, 
    value2, 
    formatFn, 
  }: { 
    label: string; 
    value1: number | string; 
    value2: number | string; 
    formatFn?: (v: any) => string;
  }) => {
    const num1 = typeof value1 === 'number' ? value1 : parseFloat(String(value1));
    const num2 = typeof value2 === 'number' ? value2 : parseFloat(String(value2));
    
    const winner1 = !isNaN(num1) && !isNaN(num2) && num1 > num2;
    const winner2 = !isNaN(num1) && !isNaN(num2) && num2 > num1;
    
    const display1 = formatFn ? formatFn(value1) : String(value1);
    const display2 = formatFn ? formatFn(value2) : String(value2);
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: scale(14), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.extraBold, fontSize: fontScale(16), color: winner1 ? '#86EFAC' : winner2 ? '#FCA5A5' : '#FFFFFF' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {display1}
          </Text>
        </View>
        <View style={{ paddingHorizontal: scale(16), alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(11), color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.extraBold, fontSize: fontScale(16), color: winner2 ? '#86EFAC' : winner1 ? '#FCA5A5' : '#FFFFFF' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {display2}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <LinearGradient
      colors={['#7C3AED', '#6366F1', '#4F46E5']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(20), paddingTop: scale(60), paddingBottom: scale(20) }}>
        <TouchableOpacity 
          style={{ width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={scale(22)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(20), color: '#FFFFFF' }}>Compare</Text>
        <View style={{ width: scale(40) }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: scale(40) }}>
        {/* Mode Switcher */}
        <View style={{ paddingHorizontal: scale(20), marginBottom: scale(24) }}>
           <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: scale(14), padding: 4 }}>
               {(['months', 'trades'] as const).map(mode => (
                   <TouchableOpacity
                      key={mode}
                      onPress={() => {
                          setCompareMode(mode);
                          setSelectedMonth1(null);
                          setSelectedMonth2(null);
                          setSelectedTrade1(null);
                          setSelectedTrade2(null);
                      }}
                      style={{
                          flex: 1,
                          paddingVertical: scale(10),
                          alignItems: 'center',
                          borderRadius: scale(12),
                          backgroundColor: compareMode === mode ? 'rgba(255,255,255,0.2)' : 'transparent',
                      }}
                   >
                       <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(14), color: compareMode === mode ? '#FFFFFF' : 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                           {mode}
                       </Text>
                   </TouchableOpacity>
               ))}
           </View>
        </View>

        {/* Selectors */}
        <View style={{ paddingHorizontal: scale(20), marginBottom: scale(24) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
            <SelectorCard slot={1} />
            
            {/* VS Badge */}
            <View style={{ position: 'absolute', left: '50%', marginLeft: -scale(20), zIndex: 10 }}>
              <View style={{ width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 }}>
                <Ionicons name="git-compare" size={scale(18)} color="#7C3AED" />
              </View>
            </View>
            
            <SelectorCard slot={2} />
          </View>
        </View>

        {/* Results */}
        {hasSelections && (
          <View style={{ marginHorizontal: scale(20), backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: scale(20), padding: scale(20) }}>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(13), color: 'rgba(255,255,255,0.5)', marginBottom: scale(16), textTransform: 'uppercase', letterSpacing: 1 }}>
              Comparison
            </Text>
            
            {compareMode === 'months' && selectedMonth1 && selectedMonth2 && (
              <>
                <ComparisonRow label="P&L" value1={selectedMonth1.netProfitLoss} value2={selectedMonth2.netProfitLoss} formatFn={(v) => formatCurrency(v, true)} />
                <ComparisonRow label="Return" value1={selectedMonth1.returnPercentage} value2={selectedMonth2.returnPercentage} formatFn={(v) => formatPercentage(v, true)} />
                <ComparisonRow label="Start" value1={selectedMonth1.startingCapital} value2={selectedMonth2.startingCapital} formatFn={formatCurrency} />
                <ComparisonRow label="End" value1={selectedMonth1.endingCapital} value2={selectedMonth2.endingCapital} formatFn={formatCurrency} />
              </>
            )}
            
            {compareMode === 'trades' && selectedTrade1 && selectedTrade2 && (
              <>
                <ComparisonRow label="P&L" value1={selectedTrade1.pnl} value2={selectedTrade2.pnl} formatFn={(v) => formatCurrency(v, true)} />
                <ComparisonRow label="Return" value1={selectedTrade1.returnPercentage} value2={selectedTrade2.returnPercentage} formatFn={(v) => formatPercentage(v, true)} />
                <ComparisonRow label="Entry" value1={selectedTrade1.entryPrice} value2={selectedTrade2.entryPrice} formatFn={formatCurrency} />
                <ComparisonRow label="Exit" value1={selectedTrade1.exitPrice} value2={selectedTrade2.exitPrice} formatFn={formatCurrency} />
                <ComparisonRow label="Qty" value1={selectedTrade1.quantity} value2={selectedTrade2.quantity} />
              </>
            )}
          </View>
        )}

        {/* Empty State */}
        {!hasSelections && (
          <View style={{ alignItems: 'center', paddingVertical: scale(40), paddingHorizontal: scale(40) }}>
            <View style={{ width: scale(72), height: scale(72), borderRadius: scale(36), backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: scale(16) }}>
              <Ionicons name="git-compare" size={scale(32)} color="rgba(255,255,255,0.5)" />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(18), color: '#FFFFFF', marginBottom: scale(8) }}>
                Select Two {compareMode === 'months' ? 'Months' : 'Trades'}
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: fontScale(20) }}>
              Tap the cards above to select items for comparison
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1F1F23', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), paddingTop: scale(20), maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(20), marginBottom: scale(16) }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: '#FFFFFF' }}>
                Select {compareMode === 'months' ? 'Month' : 'Trade'} {pickingFor}
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close-circle" size={scale(28)} color="#71717A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ paddingHorizontal: scale(20), paddingBottom: scale(40) }} showsVerticalScrollIndicator={false}>
              {compareMode === 'months' && (
                closedMonths.length === 0 ? (
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: '#71717A', textAlign: 'center', paddingVertical: scale(40) }}>No closed months available</Text>
                ) : (
                    closedMonths.map((month) => {
                        const isSelected = (pickingFor === 1 && selectedMonth1?.id === month.id) || (pickingFor === 2 && selectedMonth2?.id === month.id);
                        const isDisabled = (pickingFor === 1 && selectedMonth2?.id === month.id) || (pickingFor === 2 && selectedMonth1?.id === month.id);
                        
                        return (
                          <TouchableOpacity
                            key={month.id}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: scale(16), paddingHorizontal: scale(16), borderRadius: scale(12), marginBottom: scale(8), backgroundColor: isSelected ? 'rgba(99,102,241,0.2)' : 'transparent', opacity: isDisabled ? 0.4 : 1 }}
                            onPress={() => !isDisabled && handleSelectMonth(month)}
                            disabled={isDisabled}
                          >
                            <View>
                              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(16), color: '#FFFFFF' }}>{formatMonthDisplay(month.month)}</Text>
                              <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(12), color: '#71717A', marginTop: scale(2) }}>{formatPercentage(month.returnPercentage, true)} return</Text>
                            </View>
                            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: month.netProfitLoss >= 0 ? colors.profit : colors.loss }}>{formatCurrency(month.netProfitLoss, true)}</Text>
                          </TouchableOpacity>
                        );
                    })
                )
              )}
              
              {compareMode === 'trades' && (
                sortedTrades.length === 0 ? (
                    <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: '#71717A', textAlign: 'center', paddingVertical: scale(40) }}>No trades available</Text>
                ) : (
                    sortedTrades.map((trade) => {
                        const isSelected = (pickingFor === 1 && selectedTrade1?.id === trade.id) || (pickingFor === 2 && selectedTrade2?.id === trade.id);
                        const isDisabled = (pickingFor === 1 && selectedTrade2?.id === trade.id) || (pickingFor === 2 && selectedTrade1?.id === trade.id);
                        
                        return (
                          <TouchableOpacity
                            key={trade.id}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: scale(16), paddingHorizontal: scale(16), borderRadius: scale(12), marginBottom: scale(8), backgroundColor: isSelected ? 'rgba(99,102,241,0.2)' : 'transparent', opacity: isDisabled ? 0.4 : 1 }}
                            onPress={() => !isDisabled && handleSelectTrade(trade)}
                            disabled={isDisabled}
                          >
                            <View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(16), color: '#FFFFFF' }}>{trade.symbol}</Text>
                                <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: trade.tradeType === 'long' ? 'rgba(16, 185, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                                    <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: trade.tradeType === 'long' ? '#10B95F' : '#EF4444' }}>{trade.tradeType.toUpperCase()}</Text>
                                </View>
                              </View>
                              <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(12), color: '#71717A', marginTop: scale(2) }}>{new Date(trade.exitDate).toLocaleDateString()}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: trade.pnl >= 0 ? colors.profit : colors.loss }}>{formatCurrency(trade.pnl, true)}</Text>
                                <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: '#71717A' }}>{formatPercentage(trade.returnPercentage, true)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                    })
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
