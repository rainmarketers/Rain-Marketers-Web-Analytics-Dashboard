import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RainAnalyticsDashboard from '../components/RainAnalyticsDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Client {
  id: number;
  name: string;
  ga4_property_id?: string;
  gsc_site_url?: string;
  contact_email?: string;
  website?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`, { withCredentials: true });
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (client: Omit<Client, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/clients`, client, { withCredentials: true });
      setClients([...clients, response.data]);
    } catch (error) {
      console.error('Failed to add client:', error);
      alert('Failed to add client');
    }
  };

  const handleUpdateClient = async (id: number, client: Omit<Client, 'id'>) => {
    try {
      const response = await axios.put(`${API_URL}/clients/${id}`, client, { withCredentials: true });
      setClients(clients.map(c => c.id === id ? response.data : c));
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client');
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/clients/${id}`, { withCredentials: true });
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleGenerateReport = (clientId: number) => {
    navigate(`/reports/${clientId}`);
  };

  return (
    <RainAnalyticsDashboard
      mode="dashboard"
      clients={clients}
      onAddClient={handleAddClient}
      onUpdateClient={handleUpdateClient}
      onDeleteClient={handleDeleteClient}
      onLogout={handleLogout}
      onNavigateToReport={handleGenerateReport}
      onNavigateToDashboard={() => {}}
    />
  );
}
