/**
 * Unit Tests for Trade Calculation Service
 * 
 * These tests verify that trade P&L calculations, statistics,
 * and streak calculations work correctly.
 */

import {
    calculateMonthlyPnLFromTrades,
    calculateStreaks,
    calculateTradePnL,
    calculateTradeStats,
    getRecentTrades,
    getUniqueSymbols,
    groupTradesByMonth,
} from '../services/tradeCalculationService';
import { Trade } from '../types';

// Helper to create a mock trade
function createMockTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: 'test-id',
    symbol: 'AAPL',
    tradeType: 'long',
    entryDate: '2024-01-10',
    exitDate: '2024-01-15',
    entryPrice: 100,
    exitPrice: 110,
    quantity: 10,
    pnl: 100,
    returnPercentage: 10,
    notes: '',
    tags: [],
    monthKey: '2024-01',
    isWin: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('calculateTradePnL', () => {
  describe('Long trades', () => {
    test('calculates profit on long trade', () => {
      // Buy at $100, sell at $110, 10 shares = $100 profit
      const result = calculateTradePnL(100, 110, 10, 'long');
      
      expect(result.pnl).toBe(100);
      expect(result.returnPercentage).toBe(10);
      expect(result.isWin).toBe(true);
    });

    test('calculates loss on long trade', () => {
      // Buy at $100, sell at $90, 10 shares = -$100 loss
      const result = calculateTradePnL(100, 90, 10, 'long');
      
      expect(result.pnl).toBe(-100);
      expect(result.returnPercentage).toBe(-10);
      expect(result.isWin).toBe(false);
    });

    test('handles break-even trade', () => {
      const result = calculateTradePnL(100, 100, 10, 'long');
      
      expect(result.pnl).toBe(0);
      expect(result.returnPercentage).toBe(0);
      expect(result.isWin).toBe(false);
    });
  });

  describe('Short trades', () => {
    test('calculates profit on short trade (price goes down)', () => {
      // Short at $100, cover at $90, 10 shares = $100 profit
      const result = calculateTradePnL(100, 90, 10, 'short');
      
      expect(result.pnl).toBe(100);
      expect(result.returnPercentage).toBe(10);
      expect(result.isWin).toBe(true);
    });

    test('calculates loss on short trade (price goes up)', () => {
      // Short at $100, cover at $110, 10 shares = -$100 loss
      const result = calculateTradePnL(100, 110, 10, 'short');
      
      expect(result.pnl).toBe(-100);
      expect(result.returnPercentage).toBe(-10);
      expect(result.isWin).toBe(false);
    });
  });

  describe('Edge cases', () => {
    test('handles zero entry price', () => {
      const result = calculateTradePnL(0, 100, 10, 'long');
      
      expect(result.pnl).toBe(1000);
      expect(result.returnPercentage).toBe(0); // Can't calculate % from 0
    });

    test('handles fractional shares', () => {
      const result = calculateTradePnL(100, 110, 0.5, 'long');
      
      expect(result.pnl).toBe(5);
    });

    test('handles large numbers', () => {
      const result = calculateTradePnL(50000, 55000, 100, 'long');
      
      expect(result.pnl).toBe(500000);
      expect(result.returnPercentage).toBe(10);
    });
  });
});

describe('calculateTradeStats', () => {
  test('returns empty stats for empty array', () => {
    const result = calculateTradeStats([]);
    
    expect(result.totalTrades).toBe(0);
    expect(result.winRate).toBe(0);
    expect(result.bestTrade).toBeNull();
    expect(result.worstTrade).toBeNull();
  });

  test('calculates stats for single winning trade', () => {
    const trades = [createMockTrade({ pnl: 100 })];
    const result = calculateTradeStats(trades);
    
    expect(result.totalTrades).toBe(1);
    expect(result.winningTrades).toBe(1);
    expect(result.losingTrades).toBe(0);
    expect(result.winRate).toBe(100);
    expect(result.totalPnL).toBe(100);
  });

  test('calculates stats for single losing trade', () => {
    const trades = [createMockTrade({ pnl: -50, isWin: false })];
    const result = calculateTradeStats(trades);
    
    expect(result.totalTrades).toBe(1);
    expect(result.winningTrades).toBe(0);
    expect(result.losingTrades).toBe(1);
    expect(result.winRate).toBe(0);
    expect(result.avgLoss).toBe(50);
  });

  test('identifies best and worst trades', () => {
    const trades = [
      createMockTrade({ id: '1', pnl: 50 }),
      createMockTrade({ id: '2', pnl: 200 }),
      createMockTrade({ id: '3', pnl: -30 }),
    ];
    const result = calculateTradeStats(trades);
    
    expect(result.bestTrade?.id).toBe('2');
    expect(result.worstTrade?.id).toBe('3');
  });

  test('calculates profit factor correctly', () => {
    const trades = [
      createMockTrade({ pnl: 100 }),  // Win
      createMockTrade({ pnl: 50 }),   // Win
      createMockTrade({ pnl: -25 }),  // Loss
    ];
    const result = calculateTradeStats(trades);
    
    // Total profit: $150, Total loss: $25
    // Profit factor: 150 / 25 = 6
    expect(result.profitFactor).toBe(6);
  });

  test('handles all wins (infinite profit factor)', () => {
    const trades = [
      createMockTrade({ pnl: 100 }),
      createMockTrade({ pnl: 50 }),
    ];
    const result = calculateTradeStats(trades);
    
    expect(result.profitFactor).toBe(Infinity);
  });

  test('calculates average win and loss correctly', () => {
    const trades = [
      createMockTrade({ pnl: 100 }),   // Win
      createMockTrade({ pnl: 200 }),   // Win
      createMockTrade({ pnl: -60 }),   // Loss
      createMockTrade({ pnl: -40 }),   // Loss
    ];
    const result = calculateTradeStats(trades);
    
    // Average win: (100 + 200) / 2 = 150
    // Average loss: (60 + 40) / 2 = 50
    expect(result.avgWin).toBe(150);
    expect(result.avgLoss).toBe(50);
  });

  test('counts break-even trades correctly', () => {
    const trades = [
      createMockTrade({ pnl: 100 }),   // Win
      createMockTrade({ pnl: 0 }),     // Break-even
      createMockTrade({ pnl: -50 }),   // Loss
    ];
    const result = calculateTradeStats(trades);
    
    expect(result.winningTrades).toBe(1);
    expect(result.losingTrades).toBe(1);
    expect(result.breakEvenTrades).toBe(1);
  });
});

describe('calculateStreaks', () => {
  test('returns zeros for empty array', () => {
    const result = calculateStreaks([]);
    
    expect(result.currentStreak).toBe(0);
    expect(result.longestWinStreak).toBe(0);
    expect(result.longestLoseStreak).toBe(0);
  });

  test('calculates winning streak', () => {
    const trades = [
      createMockTrade({ pnl: 100, exitDate: '2024-01-01' }),
      createMockTrade({ pnl: 50, exitDate: '2024-01-02' }),
      createMockTrade({ pnl: 75, exitDate: '2024-01-03' }),
    ];
    const result = calculateStreaks(trades);
    
    expect(result.currentStreak).toBe(3);
    expect(result.longestWinStreak).toBe(3);
  });

  test('calculates losing streak with negative current', () => {
    const trades = [
      createMockTrade({ pnl: -50, exitDate: '2024-01-01' }),
      createMockTrade({ pnl: -30, exitDate: '2024-01-02' }),
    ];
    const result = calculateStreaks(trades);
    
    expect(result.currentStreak).toBe(-2); // Negative for losing streak
    expect(result.longestLoseStreak).toBe(2);
  });

  test('tracks longest streaks correctly', () => {
    const trades = [
      createMockTrade({ pnl: 100, exitDate: '2024-01-01' }),
      createMockTrade({ pnl: 100, exitDate: '2024-01-02' }),
      createMockTrade({ pnl: 100, exitDate: '2024-01-03' }), // 3 wins
      createMockTrade({ pnl: -50, exitDate: '2024-01-04' }),
      createMockTrade({ pnl: -50, exitDate: '2024-01-05' }), // 2 losses
      createMockTrade({ pnl: 100, exitDate: '2024-01-06' }), // End on win
    ];
    const result = calculateStreaks(trades);
    
    expect(result.longestWinStreak).toBe(3);
    expect(result.longestLoseStreak).toBe(2);
    expect(result.currentStreak).toBe(1); // Ended on 1 win
  });
});

describe('calculateMonthlyPnLFromTrades', () => {
  test('sums P&L for matching month', () => {
    const trades = [
      createMockTrade({ pnl: 100, monthKey: '2024-01' }),
      createMockTrade({ pnl: 50, monthKey: '2024-01' }),
      createMockTrade({ pnl: 200, monthKey: '2024-02' }), // Different month
    ];
    
    const result = calculateMonthlyPnLFromTrades(trades, '2024-01');
    expect(result).toBe(150);
  });

  test('returns 0 for month with no trades', () => {
    const trades = [
      createMockTrade({ pnl: 100, monthKey: '2024-01' }),
    ];
    
    const result = calculateMonthlyPnLFromTrades(trades, '2024-03');
    expect(result).toBe(0);
  });
});

describe('getRecentTrades', () => {
  test('returns trades sorted newest first', () => {
    const trades = [
      createMockTrade({ id: '1', exitDate: '2024-01-01' }),
      createMockTrade({ id: '2', exitDate: '2024-01-15' }),
      createMockTrade({ id: '3', exitDate: '2024-01-10' }),
    ];
    
    const result = getRecentTrades(trades, 3);
    
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('3');
    expect(result[2].id).toBe('1');
  });

  test('limits results to specified count', () => {
    const trades = [
      createMockTrade({ exitDate: '2024-01-01' }),
      createMockTrade({ exitDate: '2024-01-02' }),
      createMockTrade({ exitDate: '2024-01-03' }),
      createMockTrade({ exitDate: '2024-01-04' }),
    ];
    
    const result = getRecentTrades(trades, 2);
    expect(result.length).toBe(2);
  });
});

describe('getUniqueSymbols', () => {
  test('returns unique symbols sorted', () => {
    const trades = [
      createMockTrade({ symbol: 'AAPL' }),
      createMockTrade({ symbol: 'TSLA' }),
      createMockTrade({ symbol: 'AAPL' }),
      createMockTrade({ symbol: 'GOOGL' }),
    ];
    
    const result = getUniqueSymbols(trades);
    
    expect(result).toEqual(['AAPL', 'GOOGL', 'TSLA']);
  });
});

describe('groupTradesByMonth', () => {
  test('groups trades by month key', () => {
    const trades = [
      createMockTrade({ id: '1', monthKey: '2024-01' }),
      createMockTrade({ id: '2', monthKey: '2024-01' }),
      createMockTrade({ id: '3', monthKey: '2024-02' }),
    ];
    
    const result = groupTradesByMonth(trades);
    
    expect(Object.keys(result).length).toBe(2);
    expect(result['2024-01'].length).toBe(2);
    expect(result['2024-02'].length).toBe(1);
  });
});
