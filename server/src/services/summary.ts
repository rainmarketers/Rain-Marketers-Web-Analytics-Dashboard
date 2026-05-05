import Anthropic from '@anthropic-ai/sdk';
import { GA4Data } from './ga4';
import { GSCData } from './gsc';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateMetricsSummary(
  ga4Data: GA4Data,
  gscData: GSCData,
  comparisonGA4Data?: GA4Data,
  comparisonGSCData?: GSCData
): Promise<string> {
  try {
    console.log('Starting summary generation...');
    console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);

    const summaryText = `
GA4 Metrics:
- Sessions: ${ga4Data.summary.sessions.toLocaleString()}
- Users: ${ga4Data.summary.users.toLocaleString()}
- New Users: ${ga4Data.summary.newUsers.toLocaleString()}
- Pageviews: ${ga4Data.summary.pageviews.toLocaleString()}
- Bounce Rate: ${ga4Data.summary.bounceRate.toFixed(1)}%
- Avg Session Duration: ${ga4Data.summary.avgSessionDuration.toFixed(1)}s
- Top Pages: ${ga4Data.topPages.slice(0, 3).map(p => p.page).join(', ')}

GSC Metrics:
- Organic Clicks: ${gscData.summary.clicks.toLocaleString()}
- Impressions: ${gscData.summary.impressions.toLocaleString()}
- Click-Through Rate: ${(gscData.summary.avgCtr * 100).toFixed(2)}%
- Avg Position: ${gscData.summary.avgPosition.toFixed(1)}
- Top Keywords: ${gscData.topQueries.slice(0, 3).map(q => q.query).join(', ')}

${
  comparisonGA4Data && comparisonGSCData
    ? `
Previous Period Comparison:
GA4:
- Sessions: ${comparisonGA4Data.summary.sessions.toLocaleString()} (${((ga4Data.summary.sessions - comparisonGA4Data.summary.sessions) / comparisonGA4Data.summary.sessions * 100).toFixed(1)}% change)
- Bounce Rate: ${comparisonGA4Data.summary.bounceRate.toFixed(1)}% (${((ga4Data.summary.bounceRate - comparisonGA4Data.summary.bounceRate) / comparisonGA4Data.summary.bounceRate * 100).toFixed(1)}% change)

GSC:
- Clicks: ${comparisonGSCData.summary.clicks.toLocaleString()} (${((gscData.summary.clicks - comparisonGSCData.summary.clicks) / comparisonGSCData.summary.clicks * 100).toFixed(1)}% change)
- CTR: ${(comparisonGSCData.summary.avgCtr * 100).toFixed(2)}% (${(((gscData.summary.avgCtr - comparisonGSCData.summary.avgCtr) / comparisonGSCData.summary.avgCtr * 100)).toFixed(1)}% change)
`
    : ''
}
`;

    console.log('Making API request to Anthropic...');
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Analyze this analytics data and provide a concise 3-sentence summary breaking down performance across all metrics. Be specific with numbers and identify key trends or insights. Format as plain text without bullet points.

${summaryText}`,
        },
      ],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Summary generated successfully');
    return summary;
  } catch (error: any) {
    console.error('Error generating summary:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      fullError: error?.toString?.(),
    });
    return 'Unable to generate summary at this time. Please check your API key.';
  }
}
