import { google } from 'googleapis';
import { getTokens } from '../db/index';

const webmasters = google.webmasters('v3');

export interface GSCData {
  summary: {
    clicks: number;
    impressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  dailyTrend: Array<{ date: string; clicks: number; impressions: number }>;
}

export async function fetchGSCData(siteUrl: string, startDate: string, endDate: string): Promise<GSCData> {
  const tokens = getTokens();
  if (!tokens) throw new Error('No authentication tokens found');

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || undefined,
    expiry_date: tokens.expiry,
  });

  try {
    // Fetch summary metrics
    const summaryResponse = await webmasters.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: [],
        rowLimit: 1,
      },
    });

    const summaryRow = summaryResponse.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const summary = {
      clicks: summaryRow.clicks || 0,
      impressions: summaryRow.impressions || 0,
      avgCtr: (summaryRow.ctr || 0) * 100,
      avgPosition: summaryRow.position || 0,
    };

    // Fetch top queries
    const queriesResponse = await webmasters.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10,
        orderBy: [{ columnName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    });

    const topQueries = (queriesResponse.data.rows || []).map((row: any) => ({
      query: row.keys?.[0] || 'Unknown',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: row.position || 0,
    }));

    // Fetch top pages
    const pagesResponse = await webmasters.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
        orderBy: [{ columnName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    });

    const topPages = (pagesResponse.data.rows || []).map((row: any) => ({
      page: row.keys?.[0] || '/',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: row.position || 0,
    }));

    // Fetch daily trend
    const trendResponse = await webmasters.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 500,
        orderBy: [{ columnName: 'date', sortOrder: 'ASCENDING' }],
      },
    });

    const dailyTrend = (trendResponse.data.rows || []).map((row: any) => ({
      date: row.keys?.[0] || '',
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
    }));

    return { summary, topQueries, topPages, dailyTrend };
  } catch (error: any) {
    const errorMsg = error.message || error.toString() || 'Unknown GSC error';
    console.error('GSC API error:', errorMsg, error);
    throw new Error(`Failed to fetch GSC data: ${errorMsg}`);
  }
}
