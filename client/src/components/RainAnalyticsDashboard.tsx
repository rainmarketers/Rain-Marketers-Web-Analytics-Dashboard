import { useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Users,
  Calendar, Download, Plus, LogOut, LayoutDashboard,
  FileText, ArrowUpRight, ArrowDownRight, X, Edit2, Trash2
} from 'lucide-react';

const C = {
  navy: '#272727',
  navyLight: '#3a3a3a',
  blue: '#e3703b',
  blueLight: '#fff0e8',
  teal: '#555747',
  tealLight: '#eeeee9',
  orange: '#e3703b',
  orangeLight: '#fff0e8',
  bg: '#f0f2f5',
  white: '#ffffff',
  text: '#272727',
  muted: '#555747',
  border: '#e5e5e5',
  green: '#16a34a',
  greenLight: '#dcfce7',
  red: '#dc2626',
  redLight: '#fee2e2',
  amber: '#d97706',
  amberLight: '#fef3c7',
  purple: '#8b5e3c',
  purpleLight: '#f5ebe0',
};

const shadow = {
  card: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)',
  hover: '0 4px 16px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.08)',
  sidebar: '2px 0 12px rgba(0,0,0,0.15)',
};

interface Client {
  id: number;
  name: string;
  ga4_property_id?: string;
  gsc_site_url?: string;
  website?: string;
  contact_email?: string;
  notes?: string;
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

interface Props {
  mode: 'dashboard' | 'report';
  clients: Client[];
  selectedClient?: Client | null;
  reportData?: ReportData | null;
  comparisonReportData?: ReportData | null;
  summary?: string;
  dateRange?: { start: string; end: string };
  comparisonMode?: boolean;
  comparisonDateRange?: { start: string; end: string };
  loading?: boolean;
  includeAISummaryInPDF?: boolean;
  onAddClient?: (client: Omit<Client, 'id'>) => void;
  onUpdateClient?: (id: number, client: Omit<Client, 'id'>) => void;
  onDeleteClient?: (id: number) => void;
  onGenerateReport?: () => void;
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  onComparisonModeChange?: (enabled: boolean) => void;
  onComparisonDateRangeChange?: (range: { start: string; end: string }) => void;
  onDownloadPDF?: (includeSummary: boolean) => void;
  onDownloadHTML?: () => void;
  onIncludeAISummaryInPDFChange?: (include: boolean) => void;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigateToReport?: (clientId: number) => void;
  onNavigateToDashboard?: () => void;
}

const Sidebar = ({ mode, selectedClient, onLogout, onNavigateToDashboard }: any) => {
  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: C.teal,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: shadow.sidebar,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Rain Marketers
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Analytics</div>
        </div>
      </div>

      {selectedClient && mode === 'report' && (
        <div style={{ padding: '14px 16px', margin: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)' }}>
          <div
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            Active Client
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: C.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>
                {selectedClient.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{selectedClient.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{selectedClient.website}</div>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: '8px 12px' }}>
        <div
          onClick={onNavigateToDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            marginBottom: 2,
            background: mode === 'dashboard' ? 'rgba(227,112,59,0.18)' : 'transparent',
            borderLeft: mode === 'dashboard' ? `3px solid ${C.orange}` : '3px solid transparent',
            color: mode === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.5)',
            fontWeight: mode === 'dashboard' ? 600 : 400,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            marginBottom: 2,
            background: mode === 'report' ? 'rgba(227,112,59,0.18)' : 'transparent',
            borderLeft: mode === 'report' ? `3px solid ${C.orange}` : '3px solid transparent',
            color: mode === 'report' ? '#fff' : 'rgba(255,255,255,0.5)',
            fontWeight: mode === 'report' ? 600 : 400,
            fontSize: 14,
          }}
        >
          <FileText size={16} />
          Reports
        </div>
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: C.orange,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>RM</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Rain Marketers</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Salem, OR</div>
          </div>
          <LogOut
            size={15}
            color="rgba(255,255,255,0.35)"
            style={{ cursor: 'pointer' }}
            onClick={onLogout}
          />
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, children }: any) => (
  <div
    style={{
      minHeight: 64,
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      padding: '16px 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backdropFilter: 'blur(8px)',
      gap: 12,
    }}
  >
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{subtitle}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {children}
    </div>
  </div>
);

const KPICard = ({ label, value, subtitle, description, change, comparisonValue, source, lowerIsBetter = false, style = {} }: any) => {
  const hasChange = change !== null && change !== undefined;
  let positive = change >= 0;
  let moderate = false;

  // Invert logic for metrics where lower is better
  if (lowerIsBetter) {
    positive = change <= 0;
  }

  // Determine if change is moderate (slightly in the "bad" direction but not severe)
  // For normal metrics (higher is better): slightly down between -10% and 0%
  // For lower-is-better metrics: slightly up between 0% and 10%
  if (hasChange) {
    if (!lowerIsBetter && change < 0 && change > -10) {
      // Normal metric: slightly decreased
      moderate = true;
    } else if (lowerIsBetter && change > 0 && change < 10) {
      // Lower-is-better metric: slightly increased
      moderate = true;
    }
  }

  let borderColor = C.border;
  if (hasChange) {
    if (positive) {
      borderColor = C.green;
    } else if (moderate) {
      borderColor = C.amber;
    } else {
      borderColor = C.red;
    }
  }

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        padding: '16px 18px',
        boxShadow: shadow.card,
        border: `2px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        {source && (
          <div style={{ fontSize: 9, fontWeight: 700, color: source === 'GA4' ? C.orange : C.teal, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {source}
          </div>
        )}
      </div>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
      {hasChange && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: positive ? C.green : (moderate ? C.amber : C.red),
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}% vs previous period
          </div>
          {comparisonValue !== null && comparisonValue !== undefined && (
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>
              Previous: {comparisonValue}
            </div>
          )}
        </div>
      )}
      {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>}
      {description && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, lineHeight: 1.3 }}>{description}</div>}
    </div>
  );
};

const Card = ({ title, children, action, style = {} }: any) => (
  <div
    style={{
      background: C.white,
      borderRadius: 14,
      boxShadow: shadow.card,
      border: `1px solid ${C.border}`,
      overflow: 'hidden',
      ...style,
    }}
  >
    {title && (
      <div style={{ padding: '18px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{title}</div>
        {action && (
          <div style={{ fontSize: 12, color: C.blue, cursor: 'pointer', fontWeight: 500 }}>
            {action}
          </div>
        )}
      </div>
    )}
    {children}
  </div>
);

const PositionBadge = ({ pos }: any) => {
  const n = parseFloat(pos);
  const color = n <= 3 ? C.green : n <= 10 ? C.orange : C.muted;
  const bg = n <= 3 ? C.greenLight : n <= 10 ? C.orangeLight : '#f3f4f6';
  return (
    <span style={{ background: bg, color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{pos}</span>
  );
};

const ProgressBar = ({ pct, color = C.orange }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#eef0f6', borderRadius: 99 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
    </div>
    <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, minWidth: 32 }}>{pct}%</span>
  </div>
);

const Th = ({ children, right }: any) => (
  <th
    style={{
      padding: '10px 14px',
      textAlign: right ? 'right' : 'left',
      fontSize: 11,
      fontWeight: 600,
      color: C.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${C.border}`,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </th>
);

const Td = ({ children, right, bold, small }: any) => (
  <td
    style={{
      padding: '11px 14px',
      textAlign: right ? 'right' : 'left',
      fontSize: small ? 12 : 13,
      fontWeight: bold ? 600 : 400,
      color: bold ? C.text : C.muted,
    }}
  >
    {children}
  </td>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.navy, borderRadius: 8, padding: '10px 14px', boxShadow: shadow.card }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
          <span style={{ color: p.color }}>{p.name}: </span>
          {p.value?.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

const DashboardScreen = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onNavigateToReport,
}: any) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    contact_email: '',
    ga4_property_id: '',
    gsc_site_url: '',
    notes: '',
  });

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.website && client.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddClient = () => {
    if (formData.name && formData.website) {
      if (editingId) {
        onUpdateClient?.(editingId, formData);
      } else {
        onAddClient?.(formData);
      }
      setFormData({ name: '', website: '', contact_email: '', ga4_property_id: '', gsc_site_url: '', notes: '' });
      setShowAddModal(false);
      setEditingId(null);
    } else {
      alert('Please fill in at least Client Name and Website');
    }
  };

  const handleDeleteClient = (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      onDeleteClient?.(id);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      website: client.website || '',
      contact_email: client.contact_email || '',
      ga4_property_id: client.ga4_property_id || '',
      gsc_site_url: client.gsc_site_url || '',
      notes: (client as any).notes || '',
    });
    setShowAddModal(true);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
      <TopBar title="Client Accounts" subtitle="Manage your client connections">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f3f4f6',
            borderRadius: 8,
            padding: '7px 12px',
            fontSize: 13,
            color: C.muted,
            border: 'none',
            outline: 'none',
            width: 200,
          }}
        />
      </TopBar>

      <div style={{ padding: '28px' }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, #3d3b36 100%)`,
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 24px rgba(39,39,39,0.25)',
          }}
        >
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Analytics Dashboard</div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Generate GA4 & GSC Reports</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
              {clients.length} client{clients.length !== 1 ? 's' : ''} connected · Select a client and generate their monthly analytics report
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditingId(null);
              setFormData({ name: '', website: '', contact_email: '', ga4_property_id: '', gsc_site_url: '', notes: '' });
            }}
            style={{
              background: C.orange,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 20px',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            <Plus size={15} /> Add Client
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filteredClients.map((client: Client) => (
            <div key={client.id} style={{ background: C.white, borderRadius: 14, boxShadow: shadow.card, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ height: 3, background: C.blue }} />
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>{client.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {client.website ? <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" style={{ color: C.orange, textDecoration: 'none' }}>{client.website}</a> : 'No website'}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '4px 10px', background: C.greenLight, color: C.green, whiteSpace: 'nowrap' }}>
                    Connected
                  </span>
                </div>

                <div style={{ background: C.bg, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>
                    30-Day Users
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>
                    Data available after first report
                  </div>
                </div>

                {client.notes && (
                  <div style={{ background: '#f9f5f0', borderRadius: 8, padding: '12px 14px', marginBottom: 18, borderLeft: `3px solid ${C.orange}` }}>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>
                      Notes
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {client.notes}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onNavigateToReport?.(client.id)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: 8,
                      border: 'none',
                      background: C.orange,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => handleEditClient(client)}
                    style={{
                      padding: '11px 12px',
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                      background: C.white,
                      color: C.text,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    style={{
                      padding: '11px 12px',
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                      background: C.white,
                      color: C.red,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <div
            style={{
              background: C.white,
              borderRadius: 14,
              border: `2px dashed ${C.border}`,
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <Users size={48} color={C.muted} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>No clients yet</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
              Add your first client to start tracking analytics and generating reports
            </div>
            <button
              onClick={() => {
                setShowAddModal(true);
                setEditingId(null);
                setFormData({ name: '', website: '', contact_email: '', ga4_property_id: '', gsc_site_url: '', notes: '' });
              }}
              style={{
                background: C.orange,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '11px 20px',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
              }}
            >
              <Plus size={15} /> Add Your First Client
            </button>
          </div>
        )}

        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: C.white, borderRadius: 16, padding: '32px', width: '100%', maxWidth: 500, boxShadow: shadow.hover }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                  {editingId ? 'Edit Client' : 'Add New Client'}
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', website: '', contact_email: '', ga4_property_id: '', gsc_site_url: '', notes: '' });
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={20} color={C.muted} />
                </button>
              </div>

              {[
                { label: 'Client Name', key: 'name', type: 'text' },
                { label: 'Website', key: 'website', type: 'text' },
                { label: 'Contact Email', key: 'contact_email', type: 'email' },
                { label: 'GA4 Property ID', key: 'ga4_property_id', type: 'text' },
                { label: 'GSC Site URL', key: 'gsc_site_url', type: 'text' },
                { label: 'Notes', key: 'notes', type: 'textarea' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(formData as any)[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        fontSize: 14,
                        color: C.text,
                        outline: 'none',
                        fontFamily: 'inherit',
                        background: '#fafbfd',
                        boxSizing: 'border-box',
                        minHeight: 100,
                        resize: 'vertical',
                      }}
                      placeholder="Add any notes about this client..."
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={(formData as any)[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        fontSize: 14,
                        color: C.text,
                        outline: 'none',
                        fontFamily: 'inherit',
                        background: '#fafbfd',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData({ name: '', website: '', contact_email: '', ga4_property_id: '', gsc_site_url: '', notes: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.border}`,
                    background: C.white,
                    color: C.text,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.orange,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {editingId ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportScreen = ({
  client,
  reportData,
  comparisonReportData,
  summary,
  dateRange,
  comparisonMode,
  comparisonDateRange,
  loading,
  includeAISummaryInPDF,
  onBack,
  onGenerateReport,
  onDateRangeChange,
  onComparisonModeChange,
  onComparisonDateRangeChange,
  onDownloadPDF,
  onDownloadHTML,
  onIncludeAISummaryInPDFChange,
  onDeleteClient,
  onUpdateClient,
  onLogout,
}: any) => {
  // @ts-ignore
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [topPagesSortBy, setTopPagesSortBy] = useState<'views' | 'users'>('views');
  const [topPagesSortDesc, setTopPagesSortDesc] = useState(true);
  const [topKeywordsSortBy, setTopKeywordsSortBy] = useState<'clicks' | 'ctr' | 'position'>('clicks');
  const [topKeywordsSortDesc, setTopKeywordsSortDesc] = useState(true);
  const [formData, setFormData] = useState({
    name: client?.name || '',
    website: client?.website || '',
    contact_email: client?.contact_email || '',
    ga4_property_id: client?.ga4_property_id || '',
    gsc_site_url: client?.gsc_site_url || '',
    notes: client?.notes || '',
  });

  const handleEditClient = () => {
    if (client?.id && formData.name && formData.website) {
      onUpdateClient?.(client.id, formData);
      setShowEditModal(false);
    } else {
      alert('Please fill in at least Client Name and Website');
    }
  };

  // @ts-ignore
  const handleDeleteClient = () => {
    if (confirm('Are you sure you want to delete this client?')) {
      onDeleteClient?.(client.id);
    }
  };


  const colors = [C.orange, C.teal, C.purple, '#d4a574', '#a78bfa', '#06b6d4'];
  const channelsData = reportData?.channels || [];
  const totalChannelSessions = channelsData.reduce((sum: number, c: any) => sum + c.sessions, 0);
  const trafficSources = channelsData.slice(0, 6).map((c: any, i: number) => ({
    name: c.channel,
    value: totalChannelSessions > 0 ? Math.round((c.sessions / totalChannelSessions) * 100) : 0,
    sessions: c.sessions,
    color: colors[i % colors.length],
  }));

  const sessionsTrend = (reportData?.dailyTrend || []).map((d: any) => {
    const date = new Date(d.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: d.sessions,
    };
  });

  const calculateChange = (current: number, previous: number): number | null => {
    if (previous === 0 || previous === null) return null;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  const getChangeValues = () => {
    if (!comparisonMode || !comparisonReportData) return {};
    return {
      sessionsChange: calculateChange(reportData?.sessions || 0, comparisonReportData?.sessions || 0),
      usersChange: calculateChange(reportData?.users || 0, comparisonReportData?.users || 0),
      newUsersChange: calculateChange(reportData?.newUsers || 0, comparisonReportData?.newUsers || 0),
      bounceRateChange: calculateChange(reportData?.bounceRate || 0, comparisonReportData?.bounceRate || 0),
      clicksChange: calculateChange(reportData?.clicks || 0, comparisonReportData?.clicks || 0),
      ctrChange: calculateChange(reportData?.ctr || 0, comparisonReportData?.ctr || 0),
      avgPositionChange: calculateChange(reportData?.avgPosition || 0, comparisonReportData?.avgPosition || 0),
    };
  };

  const changes = getChangeValues();

  const getPresetDateRange = (preset: string) => {
    const today = new Date();
    const startDate = new Date();
    let endDate = new Date(today);

    switch (preset) {
      case '7d':
        startDate.setDate(today.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(today.getDate() - 30);
        break;
      case '60d':
        startDate.setDate(today.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'mtd':
        startDate.setDate(1);
        break;
      case 'ytd':
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      default:
        return null;
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  const handlePresetClick = (preset: string) => {
    const range = getPresetDateRange(preset);
    if (range) {
      onDateRangeChange?.(range);
    }
  };

  const getComparisonPreset = (preset: string) => {
    const today = new Date();
    const currentStart = dateRange?.start ? new Date(dateRange.start) : new Date();
    const currentEnd = dateRange?.end ? new Date(dateRange.end) : today;
    const periodDays = Math.floor((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let compStart = new Date(currentStart);
    let compEnd = new Date(currentStart);

    switch (preset) {
      case 'previous':
        compEnd = new Date(currentStart);
        compEnd.setDate(compEnd.getDate() - 1);
        compStart = new Date(compEnd);
        compStart.setDate(compStart.getDate() - periodDays + 1);
        break;
      case 'prev_year':
        compStart = new Date(currentStart);
        compEnd = new Date(currentEnd);
        compStart.setFullYear(compStart.getFullYear() - 1);
        compEnd.setFullYear(compEnd.getFullYear() - 1);
        break;
    }

    return {
      start: compStart.toISOString().split('T')[0],
      end: compEnd.toISOString().split('T')[0],
    };
  };

  const handleComparisonPreset = (preset: string) => {
    const range = getComparisonPreset(preset);
    onComparisonDateRangeChange?.(range);
  };

  const getSortedTopPages = () => {
    const pages = reportData?.topPages || [];
    const sorted = [...pages].sort((a, b) => {
      let aVal = topPagesSortBy === 'views' ? a.views : a.users;
      let bVal = topPagesSortBy === 'views' ? b.views : b.users;
      return topPagesSortDesc ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  };

  const getSortedTopKeywords = () => {
    const keywords = reportData?.topKeywords || [];
    const sorted = [...keywords].sort((a, b) => {
      let aVal: number, bVal: number;
      if (topKeywordsSortBy === 'clicks') {
        aVal = a.clicks;
        bVal = b.clicks;
        return topKeywordsSortDesc ? bVal - aVal : aVal - bVal;
      } else if (topKeywordsSortBy === 'ctr') {
        aVal = a.ctr;
        bVal = b.ctr;
        return topKeywordsSortDesc ? bVal - aVal : aVal - bVal;
      } else {
        // For position, lower is better (closer to rank 1)
        aVal = a.position;
        bVal = b.position;
        return topKeywordsSortDesc ? aVal - bVal : bVal - aVal;
      }
    });
    return sorted;
  };

  const SortableHeader = ({ label, sortKey, currentSort, currentDesc, onSort }: any) => (
    <th
      onClick={() => {
        if (currentSort === sortKey) {
          onSort(sortKey, !currentDesc);
        } else {
          onSort(sortKey, true);
        }
      }}
      style={{
        padding: '10px 14px',
        textAlign: 'right',
        fontSize: 11,
        fontWeight: 600,
        color: C.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: C.bg,
        borderBottom: `1.5px solid ${C.border}`,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.bg)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        {label}
        {currentSort === sortKey && (
          <span style={{ fontSize: 10, marginLeft: 2 }}>{currentDesc ? '↓' : '↑'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
      <TopBar
        title={client?.name || 'Report'}
        subtitle={`${client?.website || ''}`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[
              { label: '7D', value: '7d' },
              { label: '30D', value: '30d' },
              { label: '60D', value: '60d' },
              { label: '90D', value: '90d' },
              { label: 'MTD', value: 'mtd' },
              { label: 'YTD', value: 'ytd' },
            ].map(preset => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                style={{
                  padding: '5px 10px',
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 5,
                  background: C.white,
                  color: C.text,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.blueLight;
                  e.currentTarget.style.borderColor = C.orange;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.white;
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Date Range Section */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                From
              </label>
              <input
                type="date"
                value={dateRange?.start || ''}
                onChange={e =>
                  onDateRangeChange?.({
                    ...dateRange,
                    start: e.target.value,
                  })
                }
                style={{
                  fontSize: 11,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 5,
                  padding: '6px 8px',
                  fontFamily: 'inherit',
                  color: C.text,
                  outline: 'none',
                  background: C.white,
                  boxSizing: 'border-box',
                  minWidth: 110,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                To
              </label>
              <input
                type="date"
                value={dateRange?.end || ''}
                onChange={e =>
                  onDateRangeChange?.({
                    ...dateRange,
                    end: e.target.value,
                  })
                }
                style={{
                  fontSize: 11,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 5,
                  padding: '6px 8px',
                  fontFamily: 'inherit',
                  color: C.text,
                  outline: 'none',
                  background: C.white,
                  boxSizing: 'border-box',
                  minWidth: 110,
                }}
              />
            </div>
          </div>

          {/* Comparison Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 8, borderLeft: `1px solid ${C.border}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: C.text, margin: 0, whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={comparisonMode}
                onChange={(e) => onComparisonModeChange?.(e.target.checked)}
                style={{ cursor: 'pointer', width: 16, height: 16 }}
              />
              Compare
            </label>
          </div>

          {/* Comparison Date Range - Conditional */}
          {comparisonMode && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 8, borderLeft: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              {/* Comparison Preset Buttons */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[
                  { label: 'Prev Period', value: 'previous' },
                  { label: 'Prev Year', value: 'prev_year' },
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handleComparisonPreset(preset.value)}
                    style={{
                      padding: '5px 10px',
                      fontSize: 10,
                      fontWeight: 600,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 5,
                      background: C.white,
                      color: C.text,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.blueLight;
                      e.currentTarget.style.borderColor = C.orange;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.white;
                      e.currentTarget.style.borderColor = C.border;
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    vs From
                  </label>
                <input
                  type="date"
                  value={comparisonDateRange?.start || ''}
                  onChange={e =>
                    onComparisonDateRangeChange?.({
                      ...comparisonDateRange,
                      start: e.target.value,
                    })
                  }
                  style={{
                    fontSize: 11,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 5,
                    padding: '6px 8px',
                    fontFamily: 'inherit',
                    color: C.text,
                    outline: 'none',
                    background: C.white,
                    boxSizing: 'border-box',
                    minWidth: 110,
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  vs To
                </label>
                <input
                  type="date"
                  value={comparisonDateRange?.end || ''}
                  onChange={e =>
                    onComparisonDateRangeChange?.({
                      ...comparisonDateRange,
                      end: e.target.value,
                    })
                  }
                  style={{
                    fontSize: 11,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 5,
                    padding: '6px 8px',
                    fontFamily: 'inherit',
                    color: C.text,
                    outline: 'none',
                    background: C.white,
                    boxSizing: 'border-box',
                    minWidth: 110,
                  }}
                />
              </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={onGenerateReport}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '7px 12px',
              borderRadius: 7,
              border: 'none',
              background: C.orange,
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          {reportData && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: C.text, margin: 0, whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={includeAISummaryInPDF}
                  onChange={(e) => onIncludeAISummaryInPDFChange?.(e.target.checked)}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
                Include AI Summary
              </label>
              <button
                onClick={() => onDownloadPDF?.(includeAISummaryInPDF)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '7px 11px',
                  borderRadius: 7,
                  border: `1.5px solid ${C.border}`,
                  background: C.white,
                  color: C.text,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                <Download size={13} /> PDF
              </button>
              <button
                onClick={onDownloadHTML}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '7px 11px',
                  borderRadius: 7,
                  border: 'none',
                  background: C.orange,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                <Download size={13} /> HTML
              </button>
            </>
          )}
          <button
            onClick={onBack}
            style={{
              padding: '7px 11px',
              borderRadius: 7,
              border: `1.5px solid ${C.border}`,
              background: C.white,
              color: C.text,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Back
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '7px 11px',
              borderRadius: 7,
              border: 'none',
              background: '#fee2e2',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Logout
          </button>
        </div>
      </TopBar>

      <div style={{ padding: '28px' }}>
        {reportData && (
          <>
            {summary && (
              <div
                style={{
                  background: '#f0f9ff',
                  borderLeft: `4px solid ${C.orange}`,
                  padding: '14px 16px',
                  marginBottom: 24,
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: C.text,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: C.orange }}>
                  Key Insights
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{summary}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <KPICard
                label="Sessions"
                value={reportData.sessions?.toLocaleString() || '0'}
                subtitle={`${reportData.users?.toLocaleString() || '0'} users`}
                description="Total website visits"
                change={changes.sessionsChange}
                comparisonValue={comparisonMode && comparisonReportData ? comparisonReportData.sessions?.toLocaleString() : null}
                source="GA4"
              />
              <KPICard
                label="Bounce Rate"
                value={reportData.bounceRate?.toFixed(1) + '%' || '0%'}
                subtitle={`from ${reportData.pageviews?.toLocaleString() || '0'} pageviews`}
                description="Sessions that left without interaction"
                change={changes.bounceRateChange}
                comparisonValue={comparisonMode && comparisonReportData ? (comparisonReportData.bounceRate?.toFixed(1) + '%') : null}
                source="GA4"
                lowerIsBetter={true}
              />
              <KPICard
                label="Avg Session Duration"
                value={reportData.avgSessionDuration || '0s'}
                subtitle="Time per session"
                description="How long visitors stay on site"
                change={null}
                source="GA4"
              />
              <KPICard
                label="Organic Clicks"
                value={reportData.clicks?.toLocaleString() || '0'}
                subtitle={`${reportData.impressions?.toLocaleString() || '0'} impressions`}
                description="Clicks from Google Search"
                change={changes.clicksChange}
                comparisonValue={comparisonMode && comparisonReportData ? comparisonReportData.clicks?.toLocaleString() : null}
                source="GSC"
              />
              <KPICard
                label="Avg Position"
                value={reportData.avgPosition?.toFixed(1) || '0'}
                subtitle={reportData.avgPosition <= 3 ? 'Top ranking' : reportData.avgPosition <= 10 ? 'First page' : 'Beyond first page'}
                description="Average ranking in search results"
                change={changes.avgPositionChange}
                comparisonValue={comparisonMode && comparisonReportData ? comparisonReportData.avgPosition?.toFixed(1) : null}
                source="GSC"
                lowerIsBetter={true}
              />
              <KPICard
                label="Click-Through Rate"
                value={reportData.ctr?.toFixed(2) + '%' || '0%'}
                subtitle={`from search impressions`}
                description="% of search impressions clicked"
                change={changes.ctrChange}
                comparisonValue={comparisonMode && comparisonReportData ? (comparisonReportData.ctr?.toFixed(2) + '%') : null}
                source="GSC"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Additional Metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <KPICard
                  label="Total Pageviews"
                  value={reportData.pageviews?.toLocaleString() || '0'}
                  subtitle={`${(reportData.pageviews && reportData.sessions) ? (reportData.pageviews / reportData.sessions).toFixed(1) : '0'} per session`}
                  description="Pages viewed across all sessions"
                  change={comparisonMode && comparisonReportData ? calculateChange(reportData.pageviews || 0, comparisonReportData.pageviews || 0) : null}
                  comparisonValue={comparisonMode && comparisonReportData ? comparisonReportData.pageviews?.toLocaleString() : null}
                  source="GA4"
                />
                <KPICard
                  label="Search Impressions"
                  value={reportData.impressions?.toLocaleString() || '0'}
                  subtitle="Times appeared in search results"
                  description="Visibility in Google Search results"
                  change={comparisonMode && comparisonReportData ? calculateChange(reportData.impressions || 0, comparisonReportData.impressions || 0) : null}
                  comparisonValue={comparisonMode && comparisonReportData ? comparisonReportData.impressions?.toLocaleString() : null}
                  source="GSC"
                />
              </div>
            </div>

            <Card title="Traffic Source Mix" style={{ marginBottom: 18 }}>
              <div style={{ padding: '18px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        label={false}
                      >
                        {trafficSources.map((entry: any, index: number) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      {/* @ts-ignore */}
                      <Tooltip formatter={(value: any, _name: string, props: any) => [`${props.payload.sessions.toLocaleString()} sessions`, 'Sessions']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {trafficSources.map((source: any, index: number) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 2, background: source.color, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 500, flex: 1, minWidth: 0 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{source.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>{source.value}% ({source.sessions.toLocaleString()})</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Sessions Trend" style={{ marginBottom: 18 }}>
              <div style={{ padding: '18px 0 12px' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={sessionsTrend} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.orange} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke={C.orange}
                      strokeWidth={2.5}
                      fill="url(#gSessions)"
                      name="Sessions"
                      dot={{ fill: C.orange, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: C.orange }}
                      label={{ fill: C.text, fontSize: 11, fontWeight: 600, offset: 12, position: 'top' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <Card title="Top Pages">
                <div style={{ padding: '0', maxHeight: 350, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <Th>Page</Th>
                        <SortableHeader label="Views" sortKey="views" currentSort={topPagesSortBy} currentDesc={topPagesSortDesc} onSort={(key: string, desc: boolean) => { setTopPagesSortBy(key as 'views' | 'users'); setTopPagesSortDesc(desc); }} />
                        <SortableHeader label="Users" sortKey="users" currentSort={topPagesSortBy} currentDesc={topPagesSortDesc} onSort={(key: string, desc: boolean) => { setTopPagesSortBy(key as 'views' | 'users'); setTopPagesSortDesc(desc); }} />
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedTopPages().slice(0, 10).map((p: any, i: number) => (
                        <tr key={i} style={{ background: i % 2 === 1 ? '#fafbfd' : C.white }}>
                          <Td>
                            <span style={{ color: C.orange, fontWeight: 500, fontSize: 12 }}>{p.page}</span>
                          </Td>
                          <Td right bold>
                            {p.views?.toLocaleString() || 0}
                          </Td>
                          <Td right>{p.users?.toLocaleString() || 0}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Top Keywords (GSC)">
                <div style={{ padding: '0', maxHeight: 350, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <Th>Keyword</Th>
                        <SortableHeader label="Clicks" sortKey="clicks" currentSort={topKeywordsSortBy} currentDesc={topKeywordsSortDesc} onSort={(key: string, desc: boolean) => { setTopKeywordsSortBy(key as 'clicks' | 'ctr' | 'position'); setTopKeywordsSortDesc(desc); }} />
                        <SortableHeader label="CTR" sortKey="ctr" currentSort={topKeywordsSortBy} currentDesc={topKeywordsSortDesc} onSort={(key: string, desc: boolean) => { setTopKeywordsSortBy(key as 'clicks' | 'ctr' | 'position'); setTopKeywordsSortDesc(desc); }} />
                        <SortableHeader label="Pos" sortKey="position" currentSort={topKeywordsSortBy} currentDesc={topKeywordsSortDesc} onSort={(key: string, desc: boolean) => { setTopKeywordsSortBy(key as 'clicks' | 'ctr' | 'position'); setTopKeywordsSortDesc(desc); }} />
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedTopKeywords().slice(0, 10).map((k: any, i: number) => (
                        <tr key={i} style={{ background: i % 2 === 1 ? '#fafbfd' : C.white }}>
                          <Td small>
                            <span style={{ color: C.text, fontWeight: 500 }}>{k.keyword}</span>
                          </Td>
                          <Td right bold>
                            {k.clicks || 0}
                          </Td>
                          <Td right>{k.ctr?.toFixed(1) || 0}%</Td>
                          <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                            <PositionBadge pos={k.position?.toFixed(1) || 'N/A'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <Card title="Traffic Sources" style={{ marginBottom: 18 }}>
              <div style={{ padding: '12px 0 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <Th>Source</Th>
                      <Th right>Sessions</Th>
                      <Th>Distribution</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.referrers || trafficSources)?.slice(0, 5).map((s: any, i: number) => {
                      const sessions = s.sessions || 0;
                      const totalSessions = reportData?.sessions || 15774;
                      const percent = Math.round((sessions / totalSessions) * 100);
                      return (
                        <tr key={i} style={{ background: i % 2 === 1 ? '#fafbfd' : C.white }}>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color || C.orange }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.source || s.name}</span>
                            </div>
                          </td>
                          <Td right bold>
                            {sessions.toLocaleString()}
                          </Td>
                          <td style={{ padding: '11px 14px' }}>
                            <ProgressBar pct={percent} color={s.color || C.orange} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {!reportData && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Calendar size={48} color={C.muted} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              No report generated yet
            </div>
            <div style={{ fontSize: 14, color: C.muted }}>
              Select a date range above and click "Generate Report" to create analytics report
            </div>
          </div>
        )}

        {showEditModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: C.white, borderRadius: 16, padding: '32px', width: '100%', maxWidth: 500, boxShadow: shadow.hover }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Edit Client</div>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={20} color={C.muted} />
                </button>
              </div>

              {[
                { label: 'Client Name', key: 'name', type: 'text' },
                { label: 'Website', key: 'website', type: 'text' },
                { label: 'Contact Email', key: 'contact_email', type: 'email' },
                { label: 'GA4 Property ID', key: 'ga4_property_id', type: 'text' },
                { label: 'GSC Site URL', key: 'gsc_site_url', type: 'text' },
                { label: 'Notes', key: 'notes', type: 'textarea' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(formData as any)[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        fontSize: 14,
                        color: C.text,
                        outline: 'none',
                        fontFamily: 'inherit',
                        background: '#fafbfd',
                        boxSizing: 'border-box',
                        minHeight: 100,
                        resize: 'vertical',
                      }}
                      placeholder="Add any notes about this client..."
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={(formData as any)[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        fontSize: 14,
                        color: C.text,
                        outline: 'none',
                        fontFamily: 'inherit',
                        background: '#fafbfd',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.border}`,
                    background: C.white,
                    color: C.text,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditClient}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.orange,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Update Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RainAnalyticsDashboard(props: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        tr:hover td { background: #fdf3ee !important; transition: background 0.1s; }
      `}</style>

      <Sidebar mode={props.mode} selectedClient={props.selectedClient} onLogout={props.onLogout} onNavigateToDashboard={props.onNavigateToDashboard} />

      {props.mode === 'dashboard' && (
        <DashboardScreen
          clients={props.clients}
          onAddClient={props.onAddClient}
          onUpdateClient={props.onUpdateClient}
          onDeleteClient={props.onDeleteClient}
          onNavigateToReport={props.onNavigateToReport}
        />
      )}

      {props.mode === 'report' && (
        <ReportScreen
          client={props.selectedClient}
          reportData={props.reportData}
          comparisonReportData={props.comparisonReportData}
          summary={props.summary}
          dateRange={props.dateRange}
          comparisonMode={props.comparisonMode}
          comparisonDateRange={props.comparisonDateRange}
          loading={props.loading}
          includeAISummaryInPDF={props.includeAISummaryInPDF}
          onBack={props.onBack}
          onGenerateReport={props.onGenerateReport}
          onDateRangeChange={props.onDateRangeChange}
          onComparisonModeChange={props.onComparisonModeChange}
          onComparisonDateRangeChange={props.onComparisonDateRangeChange}
          onDownloadPDF={props.onDownloadPDF}
          onDownloadHTML={props.onDownloadHTML}
          onIncludeAISummaryInPDFChange={props.onIncludeAISummaryInPDFChange}
          onDeleteClient={props.onDeleteClient}
          onUpdateClient={props.onUpdateClient}
          onLogout={props.onLogout}
        />
      )}
    </div>
  );
}
