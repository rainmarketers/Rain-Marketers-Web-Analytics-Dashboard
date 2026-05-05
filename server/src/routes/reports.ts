import express, { Request, Response } from 'express';
import { fetchGA4Data } from '../services/ga4';
import { fetchGSCData } from '../services/gsc';
import { buildReportHTML } from '../services/report';
import { generatePDF } from '../services/pdf';
import { generateMetricsSummary } from '../services/summary';
import { getClient } from '../db/index';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

interface GenerateReportRequest {
  clientId: number;
  startDate: string;
  endDate: string;
  comparisonStartDate?: string;
  comparisonEndDate?: string;
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { clientId, startDate, endDate, comparisonStartDate, comparisonEndDate } = req.body as GenerateReportRequest;
    console.log('Generate report request:', { clientId, startDate, endDate, comparisonStartDate, comparisonEndDate });

    if (!clientId || !startDate || !endDate) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const client = getClient(clientId);
    console.log('Client found:', client);
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    if (!client.ga4_property_id || !client.gsc_site_url) {
      res.status(400).json({ error: 'Client missing GA4 property ID or GSC site URL' });
      return;
    }

    console.log('Fetching GA4 data...');
    const ga4Data = await fetchGA4Data(client.ga4_property_id, startDate, endDate);
    console.log('GA4 data fetched');

    console.log('Fetching GSC data...');
    const gscData = await fetchGSCData(client.gsc_site_url, startDate, endDate);
    console.log('GSC data fetched');

    // Fetch comparison data if provided
    let comparisonGA4Data, comparisonGSCData;
    if (comparisonStartDate && comparisonEndDate) {
      console.log('Fetching comparison GA4 data...');
      comparisonGA4Data = await fetchGA4Data(client.ga4_property_id, comparisonStartDate, comparisonEndDate);
      console.log('Comparison GA4 data fetched');

      console.log('Fetching comparison GSC data...');
      comparisonGSCData = await fetchGSCData(client.gsc_site_url, comparisonStartDate, comparisonEndDate);
      console.log('Comparison GSC data fetched');
    }

    let summary = '';
    try {
      console.log('Generating AI summary...');
      summary = await generateMetricsSummary(ga4Data, gscData, comparisonGA4Data, comparisonGSCData);
      console.log('AI summary generated:', summary ? 'success' : 'empty');
    } catch (summaryError: any) {
      console.error('Summary generation error (non-blocking):', summaryError);
      summary = '';
    }

    const html = buildReportHTML(client.name, startDate, endDate, ga4Data, gscData, comparisonGA4Data, comparisonGSCData, summary);

    res.json({ html, ga4: ga4Data, gsc: gscData, comparisonGA4: comparisonGA4Data, comparisonGSC: comparisonGSCData, clientId, startDate, endDate, summary });
  } catch (error: any) {
    const errorMsg = error.message || error.toString() || 'Failed to generate report';
    console.error('Report generation error:', errorMsg, error);
    res.status(500).json({ error: errorMsg });
  }
});

router.post('/export-pdf', async (req: Request, res: Response) => {
  try {
    const { html } = req.body;

    if (!html) {
      res.status(400).json({ error: 'Missing HTML content' });
      return;
    }

    const pdf = await generatePDF(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

router.post('/export-html', (req: Request, res: Response) => {
  try {
    const { html, clientName, startDate, endDate } = req.body;

    if (!html) {
      res.status(400).json({ error: 'Missing HTML content' });
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${clientName}_${startDate}_${endDate}.html"`);
    res.send(html);
  } catch (error) {
    console.error('HTML export error:', error);
    res.status(500).json({ error: 'Failed to export HTML' });
  }
});

export default router;
