import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthRecord, OverallStats } from '../types';

const INSIGHTS_CACHE_KEY = '@tradex_ai_insights_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize Gemini - Note: Expo requires EXPO_PUBLIC_ prefix for env vars
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

interface CachedInsight {
  insight: string;
  timestamp: number;
  dataHash: string;
}

// Create a simple hash of the data to detect changes
function createDataHash(stats: OverallStats, monthsCount: number): string {
  return `${stats.totalProfitLoss}-${stats.winRate}-${monthsCount}`;
}

// Build the prompt for Gemini
function buildPrompt(stats: OverallStats, months: MonthRecord[], yearlyGoal?: number): string {
  const recentMonths = months
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 6)
    .map(m => `${m.month}: ${m.netProfitLoss >= 0 ? '+' : ''}$${m.netProfitLoss.toLocaleString()}`)
    .join(', ');

  const profitableMonths = months.filter(m => m.netProfitLoss > 0).length;
  const losingMonths = months.filter(m => m.netProfitLoss < 0).length;
  
  // Calculate streak
  let streak = 0;
  const sortedMonths = [...months].sort((a, b) => b.month.localeCompare(a.month));
  for (const m of sortedMonths) {
    if (m.netProfitLoss > 0) streak++;
    else break;
  }

  return `You are a friendly trading coach analyzing a trader's P&L data. Provide 2-3 SHORT, actionable insights.

DATA:
- Total P&L: $${stats.totalProfitLoss.toLocaleString()}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Profitable Months: ${profitableMonths}
- Losing Months: ${losingMonths}
- Current Win Streak: ${streak} months
- Average Win: $${(stats.averageWin || 0).toLocaleString()}
- Average Loss: $${(stats.averageLoss || 0).toLocaleString()}
- Profit Factor: ${stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
- Recent Performance: ${recentMonths || 'No data yet'}
${yearlyGoal ? `- Yearly Goal: $${yearlyGoal.toLocaleString()} (${((stats.totalProfitLoss / yearlyGoal) * 100).toFixed(0)}% complete)` : ''}

RULES:
1. Be encouraging but honest
2. Use emojis sparingly (1-2 max)
3. Keep each insight to 1-2 sentences
4. Focus on patterns, streaks, or improvement areas
5. If they're doing well, celebrate! If struggling, be supportive
6. Format as bullet points with line breaks

Respond with ONLY the insights, no intro or outro.`;
}

export interface InsightResult {
  insight: string;
  cached: boolean;
  error?: string;
}

export async function generateInsights(
  stats: OverallStats, 
  months: MonthRecord[],
  yearlyGoal?: number,
  forceRefresh: boolean = false
): Promise<InsightResult> {
  try {
    const dataHash = createDataHash(stats, months.length);
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = await AsyncStorage.getItem(INSIGHTS_CACHE_KEY);
      if (cachedData) {
        const cached: CachedInsight = JSON.parse(cachedData);
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        const dataChanged = cached.dataHash !== dataHash;
        
        if (!isExpired && !dataChanged) {
          return { insight: cached.insight, cached: true };
        }
      }
    }

    // Handle case with no data
    if (months.length === 0) {
      return {
        insight: "📊 No trading data yet!\n\nStart by adding your first month's P&L to unlock personalized AI insights about your trading performance.",
        cached: false,
      };
    }

    // Generate new insight
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const prompt = buildPrompt(stats, months, yearlyGoal);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insight = response.text();

    // Cache the result
    const cacheData: CachedInsight = {
      insight,
      timestamp: Date.now(),
      dataHash,
    };
    await AsyncStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(cacheData));

    return { insight, cached: false };
  } catch (error: any) {
    let errorMessage = error.message;
    const isQuotaError = error.message?.includes('429') || error.message?.includes('Quota exceeded');
    
    if (isQuotaError) {
        console.warn('AI Insights quota exceeded (switching to offline mode)');
        errorMessage = 'Free tier limit reached. Showing offline analysis.';
    } else {
        console.error('AI Insights error:', error);
    }
    
    // Return a fallback insight based on stats
    const fallbackInsight = generateFallbackInsight(stats, months);
    return { 
      insight: fallbackInsight, 
      cached: false, 
      error: errorMessage
    };
  }
}

// Fallback rule-based insights if API fails
function generateFallbackInsight(stats: OverallStats, months: MonthRecord[]): string {
  const insights: string[] = [];
  
  if (stats.winRate >= 60) {
    insights.push(`🎯 Strong ${stats.winRate.toFixed(0)}% win rate! You're beating most traders.`);
  } else if (stats.winRate >= 50) {
    insights.push(`📊 ${stats.winRate.toFixed(0)}% win rate. Room to improve, but you're profitable!`);
  }
  
  if (stats.profitFactor > 2) {
    insights.push(`💪 Excellent profit factor of ${stats.profitFactor.toFixed(1)}x!`);
  }
  
  if (stats.totalProfitLoss > 0) {
    insights.push(`✅ You're up $${stats.totalProfitLoss.toLocaleString()} overall. Keep it going!`);
  }
  
  if (insights.length === 0) {
    insights.push(`📈 Keep tracking your P&L to unlock deeper insights!`);
  }
  
  return insights.join('\n\n');
}

// Clear cached insights (call on logout)
export async function clearInsightsCache(): Promise<void> {
  await AsyncStorage.removeItem(INSIGHTS_CACHE_KEY);
}
