export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  weight: number;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  categoryIds: string[];
  attributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
} 