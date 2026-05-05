import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Client {
  id?: number;
  name: string;
  ga4PropertyId: string;
  gscSiteUrl: string;
  contactEmail: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [client, setClient] = useState<Client>({
    name: '',
    ga4PropertyId: '',
    gscSiteUrl: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClient(parseInt(id));
    }
  }, [id]);

  const fetchClient = async (clientId: number) => {
    try {
      const response = await axios.get(`${API_URL}/clients/${clientId}`, { withCredentials: true });
      const data = response.data;
      setClient({
        id: data.id,
        name: data.name,
        ga4PropertyId: data.ga4_property_id,
        gscSiteUrl: data.gsc_site_url,
        contactEmail: data.contact_email,
      });
    } catch (error) {
      console.error('Failed to fetch client:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: client.name,
        ga4PropertyId: client.ga4PropertyId,
        gscSiteUrl: client.gscSiteUrl,
        contactEmail: client.contactEmail,
      };

      if (id) {
        await axios.put(`${API_URL}/clients/${id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API_URL}/clients`, payload, { withCredentials: true });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save client:', error);
      alert('Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Client' : 'Add New Client'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Client Name
            </label>
            <input
              type="text"
              required
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ABC Digital Agency"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              GA4 Property ID
            </label>
            <input
              type="text"
              required
              value={client.ga4PropertyId}
              onChange={(e) => setClient({ ...client, ga4PropertyId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 123456789"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in Google Analytics 4 under Admin → Property Settings
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Google Search Console Site URL
            </label>
            <input
              type="url"
              required
              value={client.gscSiteUrl}
              onChange={(e) => setClient({ ...client, gscSiteUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., https://example.com/"
            />
            <p className="text-xs text-gray-500 mt-1">
              The exact URL as it appears in Search Console
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contact Email (Optional)
            </label>
            <input
              type="email"
              value={client.contactEmail}
              onChange={(e) => setClient({ ...client, contactEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., contact@client.com"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : id ? 'Update Client' : 'Add Client'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
