/**
 * Unit Tests for Calculation Service
 * 
 * These tests verify that P&L calculations, statistics, and metrics
 * are computed correctly for various scenarios.
 */

import {
    calculateMonthMetrics,
    calculateOverallStats,
    filterMonthsByRange,
    getRecentMonths,
} from '../services/calculationService';
import { MonthRecord } from '../types';

// Helper to create a mock month record
function createMockMonth(overrides: Partial<MonthRecord> = {}): MonthRecord {
  return {
    id: 'test-id',
    month: '2024-01',
    year: 2024,
    monthName: 'January',
    startingCapital: 10000,
    endingCapital: 11000,
    deposits: 0,
    withdrawals: 0,
    grossChange: 1000,
    netProfitLoss: 1000,
    returnPercentage: 10,
    pnlSource: 'manual',
    status: 'closed',
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('calculateMonthMetrics', () => {
  test('calculates profit correctly', () => {
    const result = calculateMonthMetrics(10000, 11000, 0, 0);
    
    expect(result.grossChange).toBe(1000);
    expect(result.netProfitLoss).toBe(1000);
    expect(result.returnPercentage).toBe(10);
  });

  test('calculates loss correctly', () => {
    const result = calculateMonthMetrics(10000, 9000, 0, 0);
    
    expect(result.grossChange).toBe(-1000);
    expect(result.netProfitLoss).toBe(-1000);
    expect(result.returnPercentage).toBe(-10);
  });

  test('accounts for deposits correctly', () => {
    // Start: $10,000, End: $12,000, Deposited: $500
    // Gross change: +$2000, but $500 was deposited
    // Net P&L: $2000 - $500 = $1500
    const result = calculateMonthMetrics(10000, 12000, 500, 0);
    
    expect(result.grossChange).toBe(2000);
    expect(result.netProfitLoss).toBe(1500);
  });

  test('accounts for withdrawals correctly', () => {
    // Start: $10,000, End: $9,500, Withdrew: $1000
    // Gross change: -$500, but $1000 was withdrawn
    // Net P&L: -$500 + $1000 = $500 profit
    const result = calculateMonthMetrics(10000, 9500, 0, 1000);
    
    expect(result.grossChange).toBe(-500);
    expect(result.netProfitLoss).toBe(500);
  });

  test('handles zero starting capital', () => {
    const result = calculateMonthMetrics(0, 1000, 0, 0);
    
    expect(result.grossChange).toBe(1000);
    expect(result.netProfitLoss).toBe(1000);
    expect(result.returnPercentage).toBe(0); // Can't calculate % from 0
  });

  test('handles complex scenario with deposits and withdrawals', () => {
    // Start: $10,000, End: $11,500, Deposited: $1000, Withdrew: $500
    // Gross change: +$1500
    // Net P&L: $1500 - $1000 + $500 = $1000
    const result = calculateMonthMetrics(10000, 11500, 1000, 500);
    
    expect(result.grossChange).toBe(1500);
    expect(result.netProfitLoss).toBe(1000);
    expect(result.returnPercentage).toBe(10);
  });
});

describe('calculateOverallStats', () => {
  test('returns empty stats for empty array', () => {
    const result = calculateOverallStats([]);
    
    expect(result.totalProfitLoss).toBe(0);
    expect(result.totalMonths).toBe(0);
    expect(result.winRate).toBe(0);
    expect(result.bestMonth).toBeNull();
    expect(result.worstMonth).toBeNull();
  });

  test('calculates stats for single profitable month', () => {
    const months = [createMockMonth({ netProfitLoss: 1000 })];
    const result = calculateOverallStats(months);
    
    expect(result.totalProfitLoss).toBe(1000);
    expect(result.totalProfit).toBe(1000);
    expect(result.totalLoss).toBe(0);
    expect(result.profitableMonths).toBe(1);
    expect(result.winRate).toBe(100);
  });

  test('calculates stats for single losing month', () => {
    const months = [createMockMonth({ netProfitLoss: -500 })];
    const result = calculateOverallStats(months);
    
    expect(result.totalProfitLoss).toBe(-500);
    expect(result.totalProfit).toBe(0);
    expect(result.totalLoss).toBe(500);
    expect(result.profitableMonths).toBe(0);
    expect(result.winRate).toBe(0);
  });

  test('identifies best and worst months', () => {
    const months = [
      createMockMonth({ id: '1', month: '2024-01', netProfitLoss: 500 }),
      createMockMonth({ id: '2', month: '2024-02', netProfitLoss: 2000 }),
      createMockMonth({ id: '3', month: '2024-03', netProfitLoss: -300 }),
    ];
    const result = calculateOverallStats(months);
    
    expect(result.bestMonth?.id).toBe('2');
    expect(result.worstMonth?.id).toBe('3');
  });

  test('calculates profit factor correctly', () => {
    const months = [
      createMockMonth({ netProfitLoss: 1000 }), // Win
      createMockMonth({ netProfitLoss: 500 }),  // Win
      createMockMonth({ netProfitLoss: -250 }), // Loss
    ];
    const result = calculateOverallStats(months);
    
    // Total profit: $1500, Total loss: $250
    // Profit factor: 1500 / 250 = 6
    expect(result.profitFactor).toBe(6);
  });

  test('handles all profits (no losses) - infinite profit factor', () => {
    const months = [
      createMockMonth({ netProfitLoss: 1000 }),
      createMockMonth({ netProfitLoss: 500 }),
    ];
    const result = calculateOverallStats(months);
    
    expect(result.profitFactor).toBe(Infinity);
  });

  test('calculates win rate correctly', () => {
    const months = [
      createMockMonth({ netProfitLoss: 100 }),   // Win
      createMockMonth({ netProfitLoss: 200 }),   // Win
      createMockMonth({ netProfitLoss: -50 }),   // Loss
      createMockMonth({ netProfitLoss: 150 }),   // Win
    ];
    const result = calculateOverallStats(months);
    
    // 3 wins out of 4 months = 75%
    expect(result.winRate).toBe(75);
    expect(result.profitableMonths).toBe(3);
  });

  test('calculates average win and loss correctly', () => {
    const months = [
      createMockMonth({ netProfitLoss: 1000 }),  // Win
      createMockMonth({ netProfitLoss: 500 }),   // Win
      createMockMonth({ netProfitLoss: -300 }),  // Loss
      createMockMonth({ netProfitLoss: -100 }),  // Loss
    ];
    const result = calculateOverallStats(months);
    
    // Average win: (1000 + 500) / 2 = 750
    // Average loss: (300 + 100) / 2 = 200
    expect(result.averageWin).toBe(750);
    expect(result.averageLoss).toBe(200);
  });
});

describe('getRecentMonths', () => {
  test('returns months sorted newest first', () => {
    const months = [
      createMockMonth({ month: '2024-01' }),
      createMockMonth({ month: '2024-03' }),
      createMockMonth({ month: '2024-02' }),
    ];
    const result = getRecentMonths(months, 3);
    
    expect(result[0].month).toBe('2024-03');
    expect(result[1].month).toBe('2024-02');
    expect(result[2].month).toBe('2024-01');
  });

  test('limits to specified count', () => {
    const months = [
      createMockMonth({ month: '2024-01' }),
      createMockMonth({ month: '2024-02' }),
      createMockMonth({ month: '2024-03' }),
      createMockMonth({ month: '2024-04' }),
    ];
    const result = getRecentMonths(months, 2);
    
    expect(result.length).toBe(2);
    expect(result[0].month).toBe('2024-04');
    expect(result[1].month).toBe('2024-03');
  });
});

describe('filterMonthsByRange', () => {
  const months = [
    createMockMonth({ month: '2024-01' }),
    createMockMonth({ month: '2024-06' }),
    createMockMonth({ month: '2024-12' }),
    createMockMonth({ month: '2023-06' }),
  ];

  test('ALL returns all months', () => {
    const result = filterMonthsByRange(months, 'ALL');
    expect(result.length).toBe(4);
  });

  test('filtering works with date ranges', () => {
    // This test depends on current date, so we just verify it returns a subset
    const result6M = filterMonthsByRange(months, '6M');
    const result1Y = filterMonthsByRange(months, '1Y');
    
    expect(result6M.length).toBeLessThanOrEqual(months.length);
    expect(result1Y.length).toBeLessThanOrEqual(months.length);
    expect(result1Y.length).toBeGreaterThanOrEqual(result6M.length);
  });
});
