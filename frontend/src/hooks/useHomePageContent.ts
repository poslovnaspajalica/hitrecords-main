import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Section {
  id: string;
  type: 'featured' | 'categories' | 'products';
  title: string;
  order: number;
  content: any;
}

export const useHomePageContent = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/homepage/sections');
      setSections(response.data);
    } catch (err) {
      setError('Greška pri dohvaćanju sekcija');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSectionOrder = async (sections: Section[]) => {
    try {
      await api.put('/api/admin/homepage/sections/order', { sections });
      setSections(sections);
    } catch (err) {
      setError('Greška pri ažuriranju redoslijeda');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return {
    sections,
    loading,
    error,
    updateSectionOrder,
    refreshSections: fetchSections
  };
}; 