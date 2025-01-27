import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  category: string;
  images: string[];
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.products);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, isLoading, error };
}; 