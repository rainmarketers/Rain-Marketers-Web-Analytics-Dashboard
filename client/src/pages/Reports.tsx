import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RainAnalyticsDashboard from '../components/RainAnalyticsDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Client {
  id: number;
  name: string;
  ga4_property_id?: string;
  gsc_site_url?: string;
  website?: string;
  contact_email?: string;
}

interface ReportData {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  avgSessionDuration: string;
  bounceRate: number;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  dailyTrend: Array<{ date: string; sessions: number }>;
  channels: Array<{ channel: string; sessions: number }>;
  topPages: Array<{ page: string; views: number; users: number; duration: string }>;
  topKeywords: Array<{ keyword: string; clicks: number; impressions: number; ctr: number; position: number }>;
  referrers: Array<{ source: string; users: number; sessions: number; conversion: number }>;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

export default function Reports() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDateRange, setComparisonDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [comparisonReportData, setComparisonReportData] = useState<ReportData | null>(null);
  const [html, setHtml] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [includeAISummaryInPDF, setIncludeAISummaryInPDF] = useState(true);

  useEffect(() => {
    if (clientId) {
      fetchClient(parseInt(clientId));
      setDefaultDates();
    }
  }, [clientId]);

  const setDefaultDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];
    setDateRange({ start: startDate, end: endDate });
    setLoading(false);
  };

  const fetchClient = async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/clients/${id}`, { withCredentials: true });
      setClient(response.data);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      navigate('/dashboard');
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/clients/${id}`, { withCredentials: true });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  const handleUpdateClient = async (id: number, clientData: any) => {
    try {
      await axios.put(`${API_URL}/clients/${id}`, clientData, { withCredentials: true });
      if (clientId) {
        fetchClient(parseInt(clientId));
      }
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client');
    }
  };

  const buildReportDataFromResponse = (response: any): ReportData => {
    const ga4 = response.ga4;
    const gsc = response.gsc;

    return {
      sessions: ga4.summary.sessions,
      users: ga4.summary.users,
      newUsers: ga4.summary.newUsers,
      pageviews: ga4.summary.pageviews,
      avgSessionDuration: formatDuration(ga4.summary.avgSessionDuration),
      bounceRate: ga4.summary.bounceRate,
      clicks: gsc.summary?.clicks || 0,
      impressions: gsc.summary?.impressions || 0,
      ctr: gsc.summary?.avgCtr || 0,
      avgPosition: gsc.summary?.avgPosition || 0,
      dailyTrend: ga4.dailyTrend || [],
      channels: ga4.channels || [],
      topPages: ga4.topPages.map((p: any) => ({
        page: p.page,
        views: p.pageviews,
        users: 0,
        duration: '0m'
      })),
      topKeywords: gsc.topQueries.map((q: any) => ({
        keyword: q.query,
        clicks: q.clicks,
        impressions: q.impressions,
        ctr: q.ctr,
        position: q.position
      })),
      referrers: ga4.channels.map((c: any) => ({
        source: c.channel,
        users: 0,
        sessions: c.sessions,
        conversion: 0
      }))
    };
  };

  const handleGenerateReportClick = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const requestData: any = {
        clientId: parseInt(clientId),
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      if (comparisonMode && comparisonDateRange.start && comparisonDateRange.end) {
        requestData.comparisonStartDate = comparisonDateRange.start;
        requestData.comparisonEndDate = comparisonDateRange.end;
      }

      const response = await axios.post(
        `${API_URL}/reports/generate`,
        requestData,
        { withCredentials: true }
      );
      setHtml(response.data.html);
      setSummary(response.data.summary || '');

      const reportData = buildReportDataFromResponse(response.data);
      setReportData(reportData);

      if (response.data.comparisonGA4 && response.data.comparisonGSC) {
        const comparisonData = buildReportDataFromResponse({
          ga4: response.data.comparisonGA4,
          gsc: response.data.comparisonGSC
        });
        setComparisonReportData(comparisonData);
      } else {
        setComparisonReportData(null);
      }
    } catch (error: any) {
      console.error('Report generation failed:', error);
      alert(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (includeSummary: boolean) => {
    if (!html || !client) return;

    try {
      let pdfHtml = html;

      if (!includeSummary) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const summarySection = doc.querySelector('[data-summary-section]');
        if (summarySection) {
          summarySection.remove();
        }
        pdfHtml = doc.documentElement.outerHTML;
      }

      const response = await axios.post(
        `${API_URL}/reports/export-pdf`,
        { html: pdfHtml },
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.name}_${dateRange.start}_${dateRange.end}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF');
    }
  };

  const downloadHTML = async () => {
    if (!html || !client) return;

    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.name}_${dateRange.start}_${dateRange.end}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('HTML download failed:', error);
      alert('Failed to download HTML');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!client || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <RainAnalyticsDashboard
      mode="report"
      clients={[]}
      selectedClient={client}
      reportData={reportData}
      comparisonReportData={comparisonReportData}
      summary={summary}
      dateRange={dateRange}
      comparisonMode={comparisonMode}
      comparisonDateRange={comparisonDateRange}
      loading={loading}
      includeAISummaryInPDF={includeAISummaryInPDF}
      onBack={() => navigate('/dashboard')}
      onGenerateReport={() => handleGenerateReportClick()}
      onDateRangeChange={(range) => {
        setDateRange(range);
        setReportData(null);
        setComparisonReportData(null);
        setSummary('');
      }}
      onComparisonModeChange={setComparisonMode}
      onComparisonDateRangeChange={(range) => {
        setComparisonDateRange(range);
        setComparisonReportData(null);
      }}
      onDownloadPDF={downloadPDF}
      onDownloadHTML={downloadHTML}
      onIncludeAISummaryInPDFChange={setIncludeAISummaryInPDF}
      onDeleteClient={handleDeleteClient}
      onUpdateClient={handleUpdateClient}
      onNavigateToDashboard={() => navigate('/dashboard')}
      onLogout={handleLogout}
    />
  );
}
