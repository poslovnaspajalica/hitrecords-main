import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Product } from '../types/product';

export const useProduct = (id?: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const updateProduct = async (data: Partial<Product>) => {
    if (!id) return;

    try {
      const response = await api.put(`/products/${id}`, data);
      setProduct(response.data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update product');
    }
  };

  return { product, isLoading, error, updateProduct };
};