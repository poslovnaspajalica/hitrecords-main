import { useState, useEffect } from 'react';
import { DashboardStats } from '../types/dashboard';
import { api } from '../lib/api';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Greška pri dohvaćanju statistike');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}; 