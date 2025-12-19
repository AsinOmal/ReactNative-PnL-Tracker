import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../config/fonts';
import { useTheme } from '../context/ThemeContext';
import { useTrading } from '../context/TradingContext';
import { generateInsights, InsightResult } from '../services/aiInsightsService';
import { fontScale, scale } from '../utils/scaling';

interface AIInsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AIInsightsModal({ visible, onClose }: AIInsightsModalProps) {
  const { isDark } = useTheme();
  const { stats, months, yearlyGoal } = useTrading();
  const insets = useSafeAreaInsets();
  
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
    border: isDark ? '#27272A' : '#E4E4E7',
  };

  const fetchInsights = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result: InsightResult = await generateInsights(stats, months, yearlyGoal, forceRefresh);
      setInsight(result.insight);
      setIsCached(result.cached);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
      setInsight('Unable to generate insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchInsights();
    }
  }, [visible]);

  const handleRefresh = () => {
    fetchInsights(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: themeColors.bg }}>
        {/* Background Gradient - Immersive */}
        <LinearGradient
           colors={isDark ? ['rgba(225, 29, 72, 0.2)', 'rgba(225, 29, 72, 0)'] : ['rgba(225, 29, 72, 0.15)', 'rgba(225, 29, 72, 0)']}
           style={{ position: 'absolute', top: 0, left: 0, right: 0, height: scale(180) }}
        />
        
        {/* Header */}
        <View style={{ 
          marginBottom: scale(4), 
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            paddingHorizontal: scale(20), 
            paddingVertical: scale(16),
            paddingTop: scale(40), // Increased top padding for better visual balance
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(225, 29, 72, 0.1)' : 'rgba(225, 29, 72, 0.05)',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
              <LinearGradient
                colors={['#E11D48', '#BE123C']}
                style={{ 
                  width: scale(48), 
                  height: scale(48), 
                  borderRadius: scale(16),
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#E11D48',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
              >
                <Ionicons name="sparkles" size={scale(24)} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(22), color: themeColors.text }}>
                  AI Insights
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4) }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: themeColors.textMuted }}>
                    Powered by Gemini
                  </Text>
                  <View style={{ width: scale(6), height: scale(6), borderRadius: scale(3), backgroundColor: '#E11D48', opacity: 0.6 }} />
                </View>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: scale(10) }}>
              <TouchableOpacity 
                onPress={handleRefresh}
                disabled={isLoading}
                style={{
                  width: scale(42),
                  height: scale(42),
                  borderRadius: scale(14),
                  backgroundColor: themeColors.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
                }}
              >
                <Ionicons 
                  name="refresh" 
                  size={scale(20)} 
                  color={isLoading ? themeColors.textMuted : themeColors.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onClose}
                style={{
                  width: scale(42),
                  height: scale(42),
                  borderRadius: scale(14),
                  backgroundColor: themeColors.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
                }}
              >
                <Ionicons name="close" size={scale(22)} color={themeColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: scale(20), paddingBottom: scale(40) }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: scale(60) }}>
              <View style={{
                width: scale(90),
                height: scale(90),
                borderRadius: scale(45),
                backgroundColor: 'rgba(225, 29, 72, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: scale(24),
                borderWidth: 1,
                borderColor: 'rgba(225, 29, 72, 0.2)',
                shadowColor: '#E11D48', shadowOffset: {width: 0, height: 0}, shadowRadius: 20, shadowOpacity: 0.3, elevation: 8
              }}>
                <ActivityIndicator size="large" color="#E11D48" />
              </View>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(18), color: themeColors.text, marginBottom: scale(8) }}>
                Analyzing Market Data...
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.textMuted, textAlign: 'center' }}>
                Our AI is reviewing your trading patterns
              </Text>
            </View>
          ) : (
            <View>
              {/* Cached indicator */}
              {isCached && !error && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: scale(6),
                  marginBottom: scale(16),
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(8),
                  backgroundColor: isDark ? 'rgba(16, 185, 95, 0.1)' : 'rgba(16, 185, 95, 0.08)',
                  borderRadius: scale(8),
                  alignSelf: 'flex-start',
                }}>
                  <Ionicons name="time-outline" size={scale(14)} color="#10B95F" />
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: '#10B95F' }}>
                    Cached • Tap refresh for new insights
                  </Text>
                </View>
              )}

              {/* Error indicator */}
              {error && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: scale(6),
                  marginBottom: scale(16),
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(8),
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                  borderRadius: scale(8),
                }}>
                  <Ionicons name="warning-outline" size={scale(14)} color="#EF4444" />
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(12), color: '#EF4444', flex: 1 }}>
                    Using offline insights (API unavailable)
                  </Text>
                </View>
              )}

              {/* Majestic Insights Card */}
              <LinearGradient
                colors={isDark ? ['rgba(31, 31, 35, 1)', 'rgba(20, 20, 22, 1)'] : ['#FFFFFF', '#F9FAFB']}
                style={{
                  borderRadius: scale(24),
                  padding: scale(28),
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(225, 29, 72, 0.3)' : 'rgba(225, 29, 72, 0.15)',
                  shadowColor: '#E11D48',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.25 : 0.1,
                  shadowRadius: 24,
                  elevation: 10,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                 {/* Subtle decorative glow */}
                 <View style={{ position: 'absolute', top: -40, right: -40, width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: 'rgba(225, 29, 72, 0.15)', opacity: 0.6 }} />
                 
                 <View style={{ flexDirection: 'row', marginBottom: scale(16), alignItems: 'center', gap: scale(8) }}>
                    <Ionicons name="bulb" size={scale(20)} color="#E11D48" />
                    <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(14), color: '#E11D48', textTransform: 'uppercase', letterSpacing: 1 }}>Analysis</Text>
                 </View>

                <View style={{
                  backgroundColor: isDark ? 'rgba(30, 30, 35, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderRadius: scale(20),
                  overflow: 'hidden',
                }}>
                  {insight.split(/\n+/).filter(line => line.trim().length > 0).map((line, index, arr) => {
                    const cleanText = line.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
                    const isLast = index === arr.length - 1;

                    // Smart Icon Selection
                    let iconName: keyof typeof Ionicons.glyphMap = 'information-circle';
                    let iconColor = themeColors.textMuted;
                    const lowerText = cleanText.toLowerCase();

                    if (lowerText.includes('win') || lowerText.includes('success') || lowerText.includes('beating')) {
                      iconName = 'trophy';
                      iconColor = '#F59E0B'; // Amber
                    } else if (lowerText.includes('profit') || lowerText.includes('gain') || lowerText.includes('up $')) {
                      iconName = 'trending-up';
                      iconColor = '#10B95F'; // Green
                    } else if (lowerText.includes('loss') || lowerText.includes('down') || lowerText.includes('struggle')) {
                      iconName = 'trending-down';
                      iconColor = '#EF4444'; // Red
                    } else if (lowerText.includes('streak') || lowerText.includes('hot')) {
                      iconName = 'flame';
                      iconColor = '#F97316'; // Orange
                    } else if (lowerText.includes('track') || lowerText.includes('pattern')) {
                      iconName = 'analytics';
                      iconColor = '#3B82F6'; // Blue
                    }

                    return (
                      <View key={index} style={{ 
                        flexDirection: 'row',
                        paddingVertical: scale(18), // Increased vertical spacing
                        paddingHorizontal: scale(16),
                        alignItems: 'flex-start',
                        gap: scale(16), // Increased gap
                      }}>
                        {/* Styled Icon Container */}
                        <View style={{
                          width: scale(32), height: scale(32), // Smaller, sharper icon
                          borderRadius: scale(10),
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          justifyContent: 'center', alignItems: 'center',
                          borderWidth: 1,
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          marginTop: scale(0), // Align center-ish with smaller text
                        }}>
                          <Ionicons name={iconName} size={scale(16)} color={iconColor} />
                        </View>

                        <Text style={{ 
                          flex: 1,
                          fontFamily: fonts.medium, 
                          fontSize: fontScale(14), // Smaller text
                          color: themeColors.text,
                          lineHeight: fontScale(20), // Tighter line height
                          letterSpacing: 0.2, // Slightly tighter tracking
                        }}>
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </LinearGradient>

              {/* Stats Summary */}
              <View style={{ marginTop: scale(24) }}>
                <Text style={{ 
                  fontFamily: fonts.bold, 
                  fontSize: fontScale(12), 
                  color: themeColors.textMuted,
                  marginBottom: scale(16),
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  opacity: 0.7,
                }}>
                  Data Source Matches
                </Text>
                
                <View style={{ 
                  flexDirection: 'row', 
                  gap: scale(12),
                }}>
                  {/* Timeline Card */}
                  <View style={{ 
                    flex: 1,
                    backgroundColor: themeColors.card, 
                    padding: scale(14),
                    borderRadius: scale(16),
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    alignItems: 'center',
                    gap: scale(8)
                  }}>
                    <Ionicons name="calendar" size={scale(20)} color={themeColors.textMuted} />
                    <View style={{ alignItems: 'center' }}>
                       <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: themeColors.text }}>{months.length}</Text>
                       <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(11), color: themeColors.textMuted }}>Months</Text>
                    </View>
                  </View>

                  {/* Win Rate Card */}
                  <View style={{ 
                    flex: 1,
                    backgroundColor: themeColors.card, 
                    padding: scale(14),
                    borderRadius: scale(16),
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    alignItems: 'center',
                    gap: scale(8)
                  }}>
                    <Ionicons name="ribbon" size={scale(20)} color="#F59E0B" />
                    <View style={{ alignItems: 'center' }}>
                       <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: themeColors.text }}>{stats.winRate.toFixed(0)}%</Text>
                       <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(11), color: themeColors.textMuted }}>Win Rate</Text>
                    </View>
                  </View>

                  {/* P&L Card */}
                  <View style={{ 
                    flex: 1,
                    backgroundColor: themeColors.card, 
                    padding: scale(14),
                    borderRadius: scale(16),
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    alignItems: 'center',
                    gap: scale(8)
                  }}>
                    <Ionicons name={stats.totalProfitLoss >= 0 ? "trending-up" : "trending-down"} size={scale(20)} color={stats.totalProfitLoss >= 0 ? '#10B95F' : '#EF4444'} />
                    <View style={{ alignItems: 'center' }}>
                       <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: stats.totalProfitLoss >= 0 ? '#10B95F' : '#EF4444' }}>
                         ${Math.abs(stats.totalProfitLoss)}
                       </Text>
                       <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(11), color: themeColors.textMuted }}>Net P&L</Text>
                    </View>
                  </View>
                </View> 

              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
