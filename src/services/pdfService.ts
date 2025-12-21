import { format } from 'date-fns';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MonthRecord, Trade } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';


/**
 * Generate clean, professional HTML content for PDF
 */
function formatPDFContent(monthData: MonthRecord, trades: Trade[] = []): string {
  const isProfit = monthData.netProfitLoss >= 0;
  const profitColor = isProfit ? '#10B95F' : '#EF4444';
  const profitBg = isProfit ? '#ECFDF5' : '#FEF2F2';
  const profitLabelColor = isProfit ? '#065F46' : '#991B1B';
  const profitSign = isProfit ? '+' : '';
  const netCashFlow = monthData.deposits - monthData.withdrawals;
  const statusText = monthData.status === 'active' ? 'Active' : 'Closed';
  const statusBg = monthData.status === 'active' ? '#EEF2FF' : '#F3F4F6';
  const statusColor = monthData.status === 'active' ? '#3B82F6' : '#6B7280';
  
  // Calculate trade stats
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const tradePnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  
  // Generate trades table rows
  const tradesHTML = trades.length > 0 ? trades.slice(0, 10).map((trade, i) => `
    <tr style="background: ${i % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; font-weight: 600;">${trade.symbol}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-transform: uppercase; font-size: 11px; color: ${trade.tradeType === 'long' ? '#10B95F' : '#EF4444'};">${trade.tradeType}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB;">${format(new Date(trade.exitDate), 'MMM dd')}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 700; color: ${trade.pnl >= 0 ? '#10B95F' : '#EF4444'};">
        ${trade.pnl >= 0 ? '+' : ''}$${Math.abs(trade.pnl).toFixed(2)}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right; color: ${trade.returnPercentage >= 0 ? '#10B95F' : '#EF4444'};">
        ${trade.returnPercentage >= 0 ? '+' : ''}${trade.returnPercentage.toFixed(1)}%
      </td>
    </tr>
  `).join('') : '';
  
  return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0; padding: 40px;
      color: #1F2937; background: #FFFFFF;
      font-size: 13px; line-height: 1.5;
    }
    
    .header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 24px; margin-bottom: 28px;
      border-bottom: 2px solid #E5E7EB;
    }
    
    .brand {
      display: flex; align-items: center; gap: 10px;
    }
    
    .brand-icon {
      width: 44px; height: 44px; background: linear-gradient(135deg, #10B95F, #059669);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      color: white;
    }
    
    .brand-text {
      font-size: 22px; font-weight: 800; color: #111827;
    }
    
    .status {
      background: ${statusBg}; color: ${statusColor};
      padding: 6px 16px; border-radius: 20px;
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
    }
    
    .title {
      font-size: 32px; font-weight: 800; color: #111827;
      margin: 0 0 24px 0;
    }
    
    .hero {
      background: ${profitBg};
      border-radius: 16px; padding: 32px;
      text-align: center; margin-bottom: 28px;
    }
    
    .hero-label {
      font-size: 11px; font-weight: 700; color: ${profitLabelColor};
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;
    }
    
    .hero-value {
      font-size: 48px; font-weight: 800; color: ${profitColor};
      margin: 0; letter-spacing: -1px;
    }
    
    .hero-percent {
      font-size: 20px; font-weight: 600; color: ${profitColor};
      margin-top: 8px;
    }
    
    .stats-grid {
      display: flex; gap: 16px; margin-bottom: 28px;
    }
    
    .stat-box {
      flex: 1; background: #F9FAFB;
      border: 1px solid #E5E7EB; border-radius: 12px;
      padding: 20px; text-align: center;
    }
    
    .stat-label {
      font-size: 10px; font-weight: 700; color: #6B7280;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }
    
    .stat-value { font-size: 22px; font-weight: 800; color: #111827; }
    
    .section {
      margin-bottom: 24px; page-break-inside: avoid;
    }
    
    .trades-section {
      page-break-before: auto;
      padding-top: 40px;
      margin-top: 20px;
    }
    
    @media print {
      .section { page-break-inside: avoid; }
    }
    
    @page { 
      margin: 60px 40px;
    }
    
    .section-title {
      font-size: 11px; font-weight: 800; color: #374151;
      text-transform: uppercase; letter-spacing: 1.5px;
      margin-bottom: 12px; padding-bottom: 8px;
      border-bottom: 1px solid #E5E7EB;
    }
    
    .card {
      background: #FFFFFF; border: 1px solid #E5E7EB;
      border-radius: 12px; overflow: hidden;
    }
    
    .row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-bottom: 1px solid #F3F4F6;
    }
    
    .row:last-child { border-bottom: none; }
    
    .row-label { color: #4B5563; font-size: 14px; font-weight: 500; }
    .row-value { font-weight: 700; font-size: 15px; color: #111827; }
    .row-value.profit { color: #10B95F; }
    .row-value.loss { color: #EF4444; }
    
    .highlight-row { background: #F9FAFB; }
    
    table {
      width: 100%; border-collapse: collapse;
      font-size: 13px;
    }
    
    th {
      background: #F3F4F6; padding: 12px 16px;
      text-align: left; font-weight: 700; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: #4B5563; border-bottom: 2px solid #E5E7EB;
    }
    
    th:last-child, th:nth-last-child(2) { text-align: right; }
    
    .notes-section {
      background: #FFFBEB; border: 1px solid #FCD34D;
      border-radius: 12px; padding: 20px;
      margin-bottom: 24px;
    }
    
    .notes-title {
      font-size: 10px; font-weight: 800; color: #92400E;
      text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;
    }
    
    .notes-text {
      color: #78350F; font-size: 14px; line-height: 1.6;
      font-style: italic; margin: 0;
    }
    
    .footer {
      text-align: center; padding-top: 24px; margin-top: 28px;
      border-top: 1px solid #E5E7EB;
    }
    
    .footer-text { color: #9CA3AF; font-size: 11px; margin: 0 0 6px 0; }
    .footer-brand { color: #10B95F; font-size: 12px; font-weight: 800; margin: 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      </div>
      <span class="brand-text">TradeX</span>
    </div>
    <span class="status">${statusText}</span>
  </div>
  
  <h1 class="title">${monthData.monthName} ${monthData.year}</h1>
  
  <div class="hero">
    <div class="hero-label">Net Profit & Loss</div>
    <div class="hero-value">${profitSign}${formatCurrency(Math.abs(monthData.netProfitLoss))}</div>
    <div class="hero-percent">${profitSign}${formatPercentage(monthData.returnPercentage)} Return</div>
  </div>
  
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-label">Starting Capital</div>
      <div class="stat-value">${formatCurrency(monthData.startingCapital)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Ending Capital</div>
      <div class="stat-value">${formatCurrency(monthData.endingCapital)}</div>
    </div>
    ${trades.length > 0 ? `
    <div class="stat-box">
      <div class="stat-label">Win Rate</div>
      <div class="stat-value">${winRate.toFixed(0)}%</div>
    </div>
    ` : ''}
  </div>
  
  <div class="section">
    <div class="section-title">Capital & Cash Flow</div>
    <div class="card">
      <div class="row">
        <span class="row-label">Gross Change</span>
        <span class="row-value ${monthData.grossChange >= 0 ? 'profit' : 'loss'}">${formatCurrency(monthData.grossChange, true)}</span>
      </div>
      <div class="row">
        <span class="row-label">Deposits</span>
        <span class="row-value profit">+${formatCurrency(monthData.deposits)}</span>
      </div>
      <div class="row">
        <span class="row-label">Withdrawals</span>
        <span class="row-value loss">-${formatCurrency(monthData.withdrawals)}</span>
      </div>
      <div class="row highlight-row">
        <span class="row-label">Net Cash Flow</span>
        <span class="row-value ${netCashFlow >= 0 ? 'profit' : 'loss'}">${formatCurrency(netCashFlow, true)}</span>
      </div>
    </div>
  </div>
  
  ${trades.length > 0 ? `
  <div class="section trades-section">
    <div class="section-title">Trades (${totalTrades} total${trades.length > 10 ? ', showing top 10' : ''})</div>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Date</th>
            <th>P&L</th>
            <th>Return</th>
          </tr>
        </thead>
        <tbody>
          ${tradesHTML}
        </tbody>
      </table>
    </div>
  </div>
  ` : ''}
  
  ${monthData.notes ? `
  <div class="notes-section">
    <div class="notes-title">Notes</div>
    <p class="notes-text">"${monthData.notes}"</p>
  </div>
  ` : ''}
  
  <div class="footer">
    <p class="footer-text">Generated on ${format(new Date(), 'MMMM dd, yyyy \'at\' h:mm a')}</p>
    <p class="footer-brand">TradeX P&L Tracker</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate PDF for a specific month
 */
export async function generateMonthlyPDF(monthData: MonthRecord, trades: Trade[] = []): Promise<string> {
  const html = formatPDFContent(monthData, trades);
  
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });
  
  return uri;
}

/**
 * Share the generated PDF
 */
export async function sharePDF(pdfUri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Trading Report',
      UTI: 'com.adobe.pdf',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

/**
 * Generate and share PDF in one step
 */
export async function generateAndSharePDF(monthData: MonthRecord, trades: Trade[] = []): Promise<void> {
  const uri = await generateMonthlyPDF(monthData, trades);
  await sharePDF(uri);
}

