import { Trade, TradeFormInput, TradeStats } from '../types';

/**
 * Calculate P&L and other derived fields for a trade
 */
export function calculateTradePnL(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  tradeType: 'long' | 'short'
): { pnl: number; returnPercentage: number; isWin: boolean } {
  const direction = tradeType === 'long' ? 1 : -1;
  const pnl = (exitPrice - entryPrice) * quantity * direction;
  const returnPercentage = entryPrice > 0 
    ? ((exitPrice - entryPrice) / entryPrice) * 100 * direction 
    : 0;
  const isWin = pnl > 0;
  
  return { pnl, returnPercentage, isWin };
}

/**
 * Create a complete trade record from form input
 */
export function createTradeRecord(
  id: string,
  form: TradeFormInput
): Trade {
  const entryPrice = parseFloat(form.entryPrice) || 0;
  const exitPrice = parseFloat(form.exitPrice) || 0;
  const quantity = parseFloat(form.quantity) || 0;
  
  const { pnl, returnPercentage, isWin } = calculateTradePnL(
    entryPrice, 
    exitPrice, 
    quantity, 
    form.tradeType
  );
  
  // Derive monthKey from exitDate (YYYY-MM)
  const exitDateObj = new Date(form.exitDate);
  const monthKey = `${exitDateObj.getFullYear()}-${String(exitDateObj.getMonth() + 1).padStart(2, '0')}`;
  
  // Parse tags from comma-separated string
  const tags = form.tags
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
  
  return {
    id,
    symbol: form.symbol.toUpperCase().trim(),
    tradeType: form.tradeType,
    entryDate: form.entryDate,
    exitDate: form.exitDate,
    entryPrice,
    exitPrice,
    quantity,
    pnl,
    returnPercentage,
    notes: form.notes.trim(),
    tags,
    monthKey,
    isWin,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Calculate streak information from trades (sorted by date)
 */
export function calculateStreaks(trades: Trade[]): {
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
} {
  if (trades.length === 0) {
    return { currentStreak: 0, longestWinStreak: 0, longestLoseStreak: 0 };
  }
  
  // Sort by exit date ascending for chronological order
  const sorted = [...trades].sort((a, b) => 
    new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()
  );
  
  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let tempWinStreak = 0;
  let tempLoseStreak = 0;
  
  for (const trade of sorted) {
    if (trade.pnl > 0) {
      // Win
      tempWinStreak++;
      tempLoseStreak = 0;
      if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
    } else if (trade.pnl < 0) {
      // Loss
      tempLoseStreak++;
      tempWinStreak = 0;
      if (tempLoseStreak > longestLoseStreak) longestLoseStreak = tempLoseStreak;
    } else {
      // Break-even, reset streaks
      tempWinStreak = 0;
      tempLoseStreak = 0;
    }
  }
  
  // Current streak from most recent trades
  const lastTrade = sorted[sorted.length - 1];
  if (lastTrade.pnl > 0) {
    currentStreak = tempWinStreak;
  } else if (lastTrade.pnl < 0) {
    currentStreak = -tempLoseStreak; // Negative for losing streak
  }
  
  return { currentStreak, longestWinStreak, longestLoseStreak };
}

/**
 * Calculate overall trade statistics
 */
export function calculateTradeStats(trades: Trade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      currentStreak: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
      bestTrade: null,
      worstTrade: null,
    };
  }
  
  let totalPnL = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakEvenTrades = 0;
  let bestTrade: Trade | null = null;
  let worstTrade: Trade | null = null;
  
  for (const trade of trades) {
    totalPnL += trade.pnl;
    
    if (trade.pnl > 0) {
      winningTrades++;
      totalProfit += trade.pnl;
    } else if (trade.pnl < 0) {
      losingTrades++;
      totalLoss += Math.abs(trade.pnl);
    } else {
      breakEvenTrades++;
    }
    
    if (!bestTrade || trade.pnl > bestTrade.pnl) {
      bestTrade = trade;
    }
    if (!worstTrade || trade.pnl < worstTrade.pnl) {
      worstTrade = trade;
    }
  }
  
  const { currentStreak, longestWinStreak, longestLoseStreak } = calculateStreaks(trades);
  
  return {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    totalPnL,
    winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0,
    avgWin: winningTrades > 0 ? totalProfit / winningTrades : 0,
    avgLoss: losingTrades > 0 ? totalLoss / losingTrades : 0,
    profitFactor: totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? Infinity : 0),
    currentStreak,
    longestWinStreak,
    longestLoseStreak,
    bestTrade,
    worstTrade,
  };
}

/**
 * Calculate monthly P&L from trades
 */
export function calculateMonthlyPnLFromTrades(trades: Trade[], monthKey: string): number {
  return trades
    .filter(t => t.monthKey === monthKey)
    .reduce((sum, t) => sum + t.pnl, 0);
}

/**
 * Group trades by month
 */
export function groupTradesByMonth(trades: Trade[]): Record<string, Trade[]> {
  return trades.reduce((acc, trade) => {
    if (!acc[trade.monthKey]) {
      acc[trade.monthKey] = [];
    }
    acc[trade.monthKey].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);
}

/**
 * Get statistics for a specific symbol
 */
export function getSymbolStats(trades: Trade[], symbol: string): TradeStats {
  const symbolTrades = trades.filter(t => t.symbol === symbol.toUpperCase());
  return calculateTradeStats(symbolTrades);
}

/**
 * Get unique symbols from trades
 */
export function getUniqueSymbols(trades: Trade[]): string[] {
  const symbols = new Set(trades.map(t => t.symbol));
  return Array.from(symbols).sort();
}

/**
 * Get recent trades (sorted newest first)
 */
export function getRecentTrades(trades: Trade[], limit = 10): Trade[] {
  return [...trades]
    .sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime())
    .slice(0, limit);
}
