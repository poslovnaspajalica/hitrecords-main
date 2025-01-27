import React from 'react';
import { RouteObject, Outlet } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { Dashboard } from '../pages/admin/Dashboard';
import { ProductsManager } from '../pages/admin/ProductsManager';
import { Promotions } from '../pages/admin/Promotions';
import { OrdersManager } from '../pages/admin/OrdersManager';
import { UsersManager } from '../pages/admin/UsersManager';
import { HomePageEditor } from '../pages/admin/HomePageEditor';
import { Settings } from '../pages/admin/Settings';

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminLayout>
      <Outlet />
    </AdminLayout>,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'products',
        element: <ProductsManager />
      },
      {
        path: 'promotions',
        element: <Promotions />
      },
      {
        path: 'orders',
        element: <OrdersManager />
      },
      {
        path: 'users',
        element: <UsersManager />
      },
      {
        path: 'homepage',
        element: <HomePageEditor />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
];

export default adminRoutes; 