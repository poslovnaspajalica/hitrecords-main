import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  startDate: string;
  endDate: string;
}

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (data: Omit<Promotion, 'id'>) => {
    try {
      await api.post('/api/admin/promotions', data);
      await fetchPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  };

  const updatePromotion = async (id: string, data: Partial<Promotion>) => {
    try {
      await api.put(`/api/admin/promotions/${id}`, data);
      await fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      await api.delete(`/api/admin/promotions/${id}`);
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  };

  return {
    promotions,
    loading,
    createPromotion,
    updatePromotion,
    deletePromotion
  };
}; 