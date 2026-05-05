import axios from 'axios';
import { getTokens } from '../db/index';

export interface GA4Data {
  summary: {
    sessions: number;
    users: number;
    newUsers: number;
    pageviews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  channels: Array<{ channel: string; sessions: number }>;
  topPages: Array<{ page: string; pageviews: number }>;
  devices: Array<{ device: string; sessions: number }>;
  countries: Array<{ country: string; sessions: number }>;
  dailyTrend: Array<{ date: string; sessions: number }>;
}

async function runGA4Report(accessToken: string, propertyId: string, request: any) {
  const response = await axios.post(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    request,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function fetchGA4Data(propertyId: string, startDate: string, endDate: string): Promise<GA4Data> {
  const tokens = getTokens();
  if (!tokens) throw new Error('No authentication tokens found');

  try {
    // Fetch summary metrics
    const summaryResponse = await runGA4Report(tokens.access_token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    const summaryRow = summaryResponse.rows?.[0]?.metricValues || [];
    const summary = {
      sessions: parseInt(summaryRow[0]?.value || '0'),
      users: parseInt(summaryRow[1]?.value || '0'),
      newUsers: parseInt(summaryRow[2]?.value || '0'),
      pageviews: parseInt(summaryRow[3]?.value || '0'),
      avgSessionDuration: parseFloat(summaryRow[4]?.value || '0'),
      bounceRate: parseFloat(summaryRow[5]?.value || '0'),
    };

    // Fetch channels
    const channelsResponse = await runGA4Report(tokens.access_token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '10',
    });

    const channels = (channelsResponse.rows || []).map((row: any) => ({
      channel: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    // Fetch top pages
    const topPagesResponse = await runGA4Report(tokens.access_token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '10',
    });

    const topPages = (topPagesResponse.rows || []).map((row: any) => ({
      page: row.dimensionValues?.[0]?.value || '/',
      pageviews: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    // Fetch devices
    const devicesResponse = await runGA4Report(tokens.access_token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    const devices = (devicesResponse.rows || []).map((row: any) => ({
      device: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    // Fetch countries
    const countriesResponse = await runGA4Report(tokens.access_token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '10',
    });

    const countries = (countriesResponse.rows || []).map((row: any) => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    // Fetch daily trend
    const trendResponse = await runGA4Report(tokens.access_token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    const dailyTrend = (trendResponse.rows || []).map((row: any) => ({
      date: row.dimensionValues?.[0]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    return { summary, channels, topPages, devices, countries, dailyTrend };
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown GA4 error';
    console.error('GA4 API error:', errorMsg, error);
    throw new Error(`Failed to fetch GA4 data: ${errorMsg}`);
  }
}
