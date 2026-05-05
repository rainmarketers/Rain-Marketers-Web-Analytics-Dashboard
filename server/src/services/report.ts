import Handlebars from 'handlebars';
import { GA4Data } from './ga4';
import { GSCData } from './gsc';
import { getSetting } from '../db/index';

function generateBarChartSVG(data: Array<{ date: string; sessions: number }>): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '<svg width="660" height="260" xmlns="http://www.w3.org/2000/svg"><rect width="660" height="260" fill="white"/><text x="330" y="130" text-anchor="middle" font-size="14" fill="#9CA3AF">No data available</text></svg>';
  }

  const chartData = data.slice(-14); // Last 14 days
  const sessionValues = chartData.map(d => d.sessions);
  const maxSessions = sessionValues.length > 0 ? Math.max(...sessionValues) : 1;
  const chartHeight = 200;
  const chartWidth = 600;
  const barWidth = chartWidth / chartData.length;
  const padding = 30;

  let svg = `<svg width="${chartWidth + padding * 2}" height="${chartHeight + padding * 2}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${chartWidth + padding * 2}" height="${chartHeight + padding * 2}" fill="white"/>`;

  // Y-axis
  svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${chartHeight + padding}" stroke="#E5E7EB" stroke-width="1"/>`;
  // X-axis
  svg += `<line x1="${padding}" y1="${chartHeight + padding}" x2="${chartWidth + padding}" y2="${chartHeight + padding}" stroke="#E5E7EB" stroke-width="1"/>`;

  // Grid lines and Y-axis labels
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    const value = Math.round(maxSessions - (maxSessions / 4) * i);
    svg += `<line x1="${padding}" y1="${y}" x2="${chartWidth + padding}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>`;
    svg += `<text x="5" y="${y + 4}" font-size="10" fill="#6B7280">${value}</text>`;
  }

  // Bars with labels
  chartData.forEach((d, i) => {
    const x = padding + i * barWidth + barWidth * 0.1;
    const barHeight = (d.sessions / maxSessions) * chartHeight;
    const y = chartHeight + padding - barHeight;
    svg += `<rect x="${x}" y="${y}" width="${barWidth * 0.8}" height="${barHeight}" fill="#e3703b" rx="4"/>`;
    // Label on top of bar
    const labelX = x + (barWidth * 0.8) / 2;
    const labelY = y - 5;
    svg += `<text x="${labelX}" y="${labelY}" font-size="10" font-weight="600" fill="#272727" text-anchor="middle">${d.sessions.toLocaleString()}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

function generatePieChartSVG(data: Array<{ channel: string; sessions: number }>): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '<div style="text-align: center; padding: 20px; color: #9CA3AF;">No data available</div>';
  }

  const total = data.reduce((sum, d) => sum + d.sessions, 0);
  if (total === 0) {
    return '<div style="text-align: center; padding: 20px; color: #9CA3AF;">No data available</div>';
  }

  const colors = ['#e3703b', '#555747', '#8b5e3c', '#d97706', '#c9573f', '#f59e0b'];
  const cx = 240, cy = 150, radius = 100;

  // Generate pie chart SVG without labels
  let svg = `<svg width="480" height="300" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 30px;">`;
  svg += `<rect width="480" height="300" fill="white"/>`;

  let currentAngle = 0;
  const channels = data.slice(0, 6);

  channels.forEach((d, i) => {
    const percentage = (d.sessions / total) * 100;
    const sliceAngle = (percentage / 100) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(currentAngle);
    const y1 = cy + radius * Math.sin(currentAngle);
    const nextAngle = currentAngle + sliceAngle;
    const x2 = cx + radius * Math.cos(nextAngle);
    const y2 = cy + radius * Math.sin(nextAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    svg += `<path d="${pathData}" fill="${colors[i % colors.length]}" stroke="white" stroke-width="2"/>`;

    currentAngle = nextAngle;
  });

  svg += `</svg>`;

  // Generate legend HTML in 3 columns - clean layout matching dashboard
  let legend = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 24px; font-size: 12px; margin-top: 10px;">';
  channels.forEach((d, i) => {
    const percentage = ((d.sessions / total) * 100).toFixed(0);
    legend += `<div style="display: flex; align-items: flex-start; gap: 10px;">
      <div style="width: 14px; height: 14px; border-radius: 2px; background-color: ${colors[i % colors.length]}; flex-shrink: 0; margin-top: 2px;"></div>
      <div style="flex: 1; min-width: 0;">
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; color: #1F2937; line-height: 1.3;">${d.channel}</div>
        <div style="font-size: 11px; color: #6B7280; line-height: 1.3;">${percentage}% (${d.sessions.toLocaleString()})</div>
      </div>
    </div>`;
  });
  legend += '</div>';

  return svg + legend;
}

Handlebars.registerHelper('barChart', function(data: any) {
  return new Handlebars.SafeString(generateBarChartSVG(data));
});

Handlebars.registerHelper('pieChart', function(data: any) {
  return new Handlebars.SafeString(generatePieChartSVG(data));
});

Handlebars.registerHelper('formatDecimal', function(value: any, places: number = 2) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  // Only show decimal places if needed
  const rounded = Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
  return rounded.toString();
});

Handlebars.registerHelper('formatNumber', function(value: any) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString();
});

Handlebars.registerHelper('formatDuration', function(seconds: any) {
  if (seconds === null || seconds === undefined || (typeof seconds === 'string' && seconds.trim() === '')) return '0m 0s';
  const num = parseFloat(seconds);
  if (isNaN(num)) return '0m 0s';
  const mins = Math.floor(num / 60);
  const secs = Math.floor(num % 60);
  return `${mins}m ${secs}s`;
});

Handlebars.registerHelper('getPositionRanking', function(position: any) {
  if (position === null || position === undefined || (typeof position === 'string' && position.trim() === '')) return 'Unknown ranking';
  const pos = parseFloat(position);
  if (isNaN(pos)) return 'Unknown ranking';
  if (pos <= 3) return 'Top ranking';
  if (pos <= 10) return 'First page';
  return 'Beyond first page';
});

Handlebars.registerHelper('channelPercent', function(sessions: number, totalSessions: number) {
  if (!totalSessions || totalSessions === 0) return '0';
  return Math.round((sessions / totalSessions) * 100);
});

Handlebars.registerHelper('positionBadge', function(position: any) {
  if (position === null || position === undefined) return '';
  const pos = parseFloat(position);
  if (isNaN(pos)) return '';
  const color = pos <= 3 ? '#16a34a' : (pos <= 10 ? '#d97706' : '#6B7280');
  const bgColor = pos <= 3 ? '#dcfce7' : (pos <= 10 ? '#fef3c7' : '#f3f4f6');
  return new Handlebars.SafeString(`<span style="background: ${bgColor}; color: ${color}; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600;">${pos.toFixed(1)}</span>`);
});

Handlebars.registerHelper('getChangeIndicator', function(currentValue: number, previousValue: number, metricName?: string) {
  if (!previousValue || previousValue === 0) return '';
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  const lowerIsBetter = metricName === 'bounceRate' || metricName === 'avgPosition';
  let isPositive = percentChange > 0;
  let isModerate = false;

  if (lowerIsBetter) {
    isPositive = percentChange < 0;
    isModerate = percentChange > 0 && percentChange < 10;
  } else {
    isModerate = percentChange < 0 && percentChange > -10;
  }

  const icon = isPositive ? '↑' : '↓';
  const color = isPositive ? '#10b981' : (isModerate ? '#d97706' : '#ef4444');
  // Format previous value: 1 decimal for avgPosition, 2 decimals for bounce rate (percentage), whole number for others
  let formattedPrevious: string;
  if (metricName === 'avgPosition') {
    formattedPrevious = parseFloat(previousValue.toString()).toFixed(1);
  } else if (metricName === 'bounceRate') {
    formattedPrevious = parseFloat(previousValue.toString()).toFixed(2) + '%';
  } else {
    formattedPrevious = Math.round(previousValue).toLocaleString();
  }
  return new Handlebars.SafeString(`<div style="color: ${color}; font-weight: 600;">${icon} ${Math.abs(percentChange).toFixed(1)}% vs previous period</div><div style="font-size: 8px; color: #6B7280; margin-top: 2px;">Previous: ${formattedPrevious}</div>`);
});

Handlebars.registerHelper('getKPIBorder', function(currentValue: number, previousValue: number, metricName?: string) {
  if (!previousValue || previousValue === 0) return 'border: 1px solid #E5E7EB;';
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  const lowerIsBetter = metricName === 'bounceRate' || metricName === 'avgPosition';
  let isPositive = percentChange > 0;
  let isModerate = false;

  if (lowerIsBetter) {
    isPositive = percentChange < 0;
    isModerate = percentChange > 0 && percentChange < 10;
  } else {
    isModerate = percentChange < 0 && percentChange > -10;
  }

  const color = isPositive ? '#10b981' : (isModerate ? '#d97706' : '#ef4444');
  return new Handlebars.SafeString(`border: 2px solid ${color};`);
});

interface ReportData {
  clientName: string;
  periodStart: string;
  periodEnd: string;
  agencyName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string | null;
  footerText: string;
  ga4: GA4Data;
  gsc: GSCData;
  comparisonGA4?: GA4Data;
  comparisonGSC?: GSCData;
}

const reportTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Analytics Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; line-height: 1.6; }
    .page { width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; background: #f0f2f5; page-break-after: always; }
    .page-content { background: white; padding: 1.5rem; border-radius: 12px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 2px solid {{primaryColor}}; padding-bottom: 1rem; }
    .logo { max-height: 60px; max-width: 150px; }
    .header-text { text-align: right; }
    .header-text h1 { font-size: 20px; margin-bottom: 0.25rem; }
    .header-text p { font-size: 12px; color: #6B7280; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; }
    .kpi-grid-2col { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; }
    .kpi-card { background: #F9FAFB; padding: 1rem; border-radius: 8px; border: 1px solid #E5E7EB; }
    .comparison-text { font-size: 9px; color: #6B7280; margin-top: 0.4rem; line-height: 1.2; }
    .comparison-badge { font-size: 9px; font-weight: 600; }
    .kpi-card .comparison-text div { margin-bottom: 2px; }
    .kpi-card .label { font-size: 10px; color: #6B7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
    .kpi-card .value { font-size: 20px; font-weight: 700; color: #1F2937; margin-top: 0.4rem; font-family: 'Courier New', monospace; }
    .kpi-card .subtitle { font-size: 10px; color: #6B7280; margin-top: 0.4rem; }
    .kpi-card .description { font-size: 9px; color: #9CA3AF; margin-top: 0.5rem; line-height: 1.4; }
    .section { margin-bottom: 1.5rem; }
    .section h2 { font-size: 14px; font-weight: 700; margin-bottom: 0.8rem; border-bottom: 1px solid #E5E7EB; padding-bottom: 0.4rem; }
    .section h3 { font-size: 12px; font-weight: 600; margin-bottom: 0.5rem; color: #1F2937; }
    .chart { margin-bottom: 1rem; text-align: center; }
    .chart svg { max-width: 100%; height: auto; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    table th { background: #e3703b; color: white; padding: 0.6rem; text-align: left; font-weight: 600; }
    table td { padding: 0.6rem; border-bottom: 1px solid #E5E7EB; }
    table tr:nth-child(even) { background: #F9FAFB; }
    .footer { border-top: 1px solid #E5E7EB; margin-top: 1rem; padding-top: 0.8rem; font-size: 9px; color: #6B7280; text-align: center; }
    .badge { font-size: 8px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; display: inline-block; }
    .badge-ga4 { color: #e3703b; background: #fff0e8; }
    .badge-gsc { color: #555747; background: #eeeee9; }
    .summary-box { background: #fff0e8; border-left: 4px solid {{primaryColor}}; padding: 1rem; margin-bottom: 1.5rem; border-radius: 6px; font-size: 11px; line-height: 1.6; color: #374151; }
    @media print {
      .page { margin: 0; background: white; }
      .page-content { padding: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="page-content">
      <div class="header">
        {{#if logo}}<img src="{{logo}}" alt="Agency Logo" class="logo">{{/if}}
        <div class="header-text">
          <h1>Analytics Report</h1>
          <p style="font-weight: 600;">{{clientName}}</p>
          <p>{{periodStart}} – {{periodEnd}}</p>
        </div>
      </div>

      {{#if summary}}
      <div class="summary-box" data-summary-section>
        <strong style="display: block; margin-bottom: 0.5rem; color: #1F2937;">Key Insights</strong>
        {{summary}}
      </div>
      {{/if}}

      <!-- Main KPI Cards (3 columns) -->
      <div class="kpi-grid">
        <div class="kpi-card" style="{{{getKPIBorder ga4.summary.sessions comparisonGA4.summary.sessions}}}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="label">Sessions</div>
            <span class="badge badge-ga4">GA4</span>
          </div>
          <div class="value">{{formatNumber ga4.summary.sessions}}</div>
          {{#if comparisonGA4}}<div class="comparison-text">{{{getChangeIndicator ga4.summary.sessions comparisonGA4.summary.sessions}}} vs previous</div>{{/if}}
          <div class="subtitle">{{formatNumber ga4.summary.users}} users</div>
          <div class="description">Total website visits</div>
        </div>
        <div class="kpi-card" style="{{{getKPIBorder ga4.summary.bounceRate comparisonGA4.summary.bounceRate 'bounceRate'}}}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="label">Bounce Rate</div>
            <span class="badge badge-ga4">GA4</span>
          </div>
          <div class="value">{{formatDecimal ga4.summary.bounceRate 1}}%</div>
          {{#if comparisonGA4}}<div class="comparison-text">{{{getChangeIndicator ga4.summary.bounceRate comparisonGA4.summary.bounceRate 'bounceRate'}}} vs previous</div>{{/if}}
          <div class="subtitle">from {{formatNumber ga4.summary.pageviews}} pageviews</div>
          <div class="description">Sessions that left without interaction</div>
        </div>
        <div class="kpi-card" style="{{{getKPIBorder ga4.summary.avgSessionDuration comparisonGA4.summary.avgSessionDuration}}}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="label">Avg Session Duration</div>
            <span class="badge badge-ga4">GA4</span>
          </div>
          <div class="value">{{formatDuration ga4.summary.avgSessionDuration}}</div>
          {{#if comparisonGA4}}<div class="comparison-text">{{{getChangeIndicator ga4.summary.avgSessionDuration comparisonGA4.summary.avgSessionDuration}}} vs previous</div>{{/if}}
          <div class="subtitle">Time per session</div>
          <div class="description">How long visitors stay on site</div>
        </div>
        <div class="kpi-card" style="{{{getKPIBorder gsc.summary.clicks comparisonGSC.summary.clicks}}}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="label">Organic Clicks</div>
            <span class="badge badge-gsc">GSC</span>
          </div>
          <div class="value">{{formatNumber gsc.summary.clicks}}</div>
          {{#if comparisonGSC}}<div class="comparison-text">{{{getChangeIndicator gsc.summary.clicks comparisonGSC.summary.clicks}}} vs previous</div>{{/if}}
          <div class="subtitle">{{formatNumber gsc.summary.impressions}} impressions</div>
          <div class="description">Clicks from Google Search</div>
        </div>
        <div class="kpi-card" style="{{{getKPIBorder gsc.summary.avgPosition comparisonGSC.summary.avgPosition 'avgPosition'}}}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="label">Avg Position</div>
            <span class="badge badge-gsc">GSC</span>
          </div>
          <div class="value">{{formatDecimal gsc.summary.avgPosition 1}}</div>
          {{#if comparisonGSC}}<div class="comparison-text">{{{getChangeIndicator gsc.summary.avgPosition comparisonGSC.summary.avgPosition 'avgPosition'}}} vs previous</div>{{/if}}
          <div class="subtitle">{{getPositionRanking gsc.summary.avgPosition}}</div>
          <div class="description">Average ranking in search results</div>
        </div>
        <div class="kpi-card" style="{{{getKPIBorder gsc.summary.avgCtr comparisonGSC.summary.avgCtr}}}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="label">Click-Through Rate</div>
            <span class="badge badge-gsc">GSC</span>
          </div>
          <div class="value">{{formatDecimal gsc.summary.avgCtr 2}}%</div>
          {{#if comparisonGSC}}<div class="comparison-text">{{{getChangeIndicator gsc.summary.avgCtr comparisonGSC.summary.avgCtr}}} vs previous</div>{{/if}}
          <div class="subtitle">from search impressions</div>
          <div class="description">% of search impressions clicked</div>
        </div>
      </div>

      <!-- Additional Metrics -->
      <div class="section">
        <h2>Additional Metrics</h2>
        <div class="kpi-grid-2col">
          <div class="kpi-card" style="{{{getKPIBorder ga4.summary.pageviews comparisonGA4.summary.pageviews}}}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="label">Total Pageviews</div>
              <span class="badge badge-ga4">GA4</span>
            </div>
            <div class="value">{{formatNumber ga4.summary.pageviews}}</div>
            {{#if comparisonGA4}}<div class="comparison-text">{{{getChangeIndicator ga4.summary.pageviews comparisonGA4.summary.pageviews}}} vs previous</div>{{/if}}
            <div class="subtitle">{{formatDecimal ga4Avg 1}} per session</div>
            <div class="description">Pages viewed across all sessions</div>
          </div>
          <div class="kpi-card" style="{{{getKPIBorder gsc.summary.impressions comparisonGSC.summary.impressions}}}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="label">Search Impressions</div>
              <span class="badge badge-gsc">GSC</span>
            </div>
            <div class="value">{{formatNumber gsc.summary.impressions}}</div>
            {{#if comparisonGSC}}<div class="comparison-text">{{{getChangeIndicator gsc.summary.impressions comparisonGSC.summary.impressions}}} vs previous</div>{{/if}}
            <div class="subtitle">Times appeared in search results</div>
            <div class="description">Visibility in Google Search results</div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="section">
        <h2>Traffic Source Mix</h2>
        <div class="chart" style="display: flex; flex-direction: column; align-items: center; padding: 10px 0;">
          {{{pieChart ga4.channels}}}
        </div>
      </div>

      <!-- Top Pages & Keywords -->
      <div class="two-col">
        <div class="section">
          <h3>Top Pages</h3>
          <table>
            <tr><th>Page</th><th style="text-align: right;">Views</th></tr>
            {{#each topPagesLimited}}
            <tr><td style="word-break: break-word; font-size: 10px;">{{this.page}}</td><td style="text-align: right;">{{this.pageviews}}</td></tr>
            {{/each}}
          </table>
        </div>
        <div class="section">
          <h3>Top Keywords (GSC)</h3>
          <table>
            <tr><th>Keyword</th><th style="text-align: right;">Clicks</th><th style="text-align: right;">CTR</th><th style="text-align: right;">Pos</th></tr>
            {{#each topQueriesLimited}}
            <tr><td style="word-break: break-word; font-size: 10px;">{{this.query}}</td><td style="text-align: right;">{{this.clicks}}</td><td style="text-align: right;">{{formatDecimal this.ctr 1}}%</td><td style="text-align: right;">{{{positionBadge this.position}}}</td></tr>
            {{/each}}
          </table>
        </div>
      </div>

      <!-- Traffic Sources -->
      <div class="section">
        <h3>Traffic Sources</h3>
        <table>
          <tr><th>Source</th><th style="text-align: right;">Sessions</th><th style="text-align: right;">%</th></tr>
          {{#each channelsLimited}}
          <tr><td>{{this.channel}}</td><td style="text-align: right;">{{this.sessions}}</td><td style="text-align: right;">{{channelPercent this.sessions ../totalSessions}}%</td></tr>
          {{/each}}
        </table>
      </div>

      <div class="footer">
        <p>{{agencyName}} | {{footerText}} | Generated {{generatedDate}}</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function buildReportHTML(
  clientName: string,
  periodStart: string,
  periodEnd: string,
  ga4Data: GA4Data,
  gscData: GSCData,
  comparisonGA4Data?: GA4Data,
  comparisonGSCData?: GSCData,
  summary?: string
): string {
  const agencyName = getSetting('agency_name') || 'Your Agency';
  const primaryColor = getSetting('primary_color') || '#e3703b';
  const secondaryColor = getSetting('secondary_color') || '#1F2937';
  const logo = getSetting('logo_base64');
  const footerText = getSetting('footer_text') || '';

  const ga4Avg = ga4Data.summary.sessions > 0 ? (ga4Data.summary.pageviews / ga4Data.summary.sessions).toFixed(1) : 0;
  const newUserRate = ga4Data.summary.users > 0 ? ((ga4Data.summary.newUsers / ga4Data.summary.users) * 100).toFixed(1) : 0;
  const totalSessions = ga4Data.summary.sessions || 1;

  // Prepare limited arrays for the template
  const topPagesLimited = ga4Data.topPages?.slice(0, 5) || [];
  const topQueriesLimited = gscData.topQueries?.slice(0, 5) || [];
  const channelsLimited = ga4Data.channels?.slice(0, 6) || [];

  const template = Handlebars.compile(reportTemplate);
  const html = template({
    clientName,
    periodStart,
    periodEnd,
    agencyName,
    primaryColor,
    secondaryColor,
    logo,
    footerText,
    ga4: ga4Data,
    gsc: gscData,
    comparisonGA4: comparisonGA4Data || null,
    comparisonGSC: comparisonGSCData || null,
    topPagesLimited,
    topQueriesLimited,
    channelsLimited,
    ga4Avg,
    newUserRate,
    totalSessions,
    generatedDate: new Date().toLocaleDateString(),
    summary: summary || '',
  });

  return html;
}
