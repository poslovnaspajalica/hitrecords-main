import React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProduct } from '../../../hooks/useProduct';
import { ImageUpload } from '../../../components/admin/ImageUpload';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  weight: number;
  categoryIds: string[];
  attributes: Record<string, string>;
  isFeatured: boolean;
}

export const ProductEdit = () => {
  const { id } = useParams();
  const { product, isLoading, updateProduct } = useProduct(id);
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct(data);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Product
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          {/* Basic Information */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be displayed publicly on the product page.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { 
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.price && (
                    <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...register('sku', { required: 'SKU is required' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.sku && (
                    <p className="mt-2 text-sm text-red-600">{errors.sku.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
                  Stock Quantity
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    {...register('stockQuantity', { 
                      required: 'Stock quantity is required',
                      min: { value: 0, message: 'Stock quantity must be positive' }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.stockQuantity && (
                    <p className="mt-2 text-sm text-red-600">{errors.stockQuantity.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Product Images</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload images of your product. The first image will be used as the featured image.
              </p>
            </div>
            <div className="mt-6">
              <ImageUpload />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}; 