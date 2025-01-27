import React from 'react';
import { Card } from '../../components/admin/Card';
import { RecentOrders } from '../../components/admin/RecentOrders';
import { SalesChart } from '../../components/admin/SalesChart';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          title="Total Orders"
          value="1,234"
          change="+12.5%"
          type="positive"
        />
        <Card
          title="Total Sales"
          value="$45,678"
          change="+8.2%"
          type="positive"
        />
        <Card
          title="Average Order Value"
          value="$123"
          change="-2.1%"
          type="negative"
        />
        <Card
          title="Conversion Rate"
          value="3.2%"
          change="+0.8%"
          type="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Sales Overview</h2>
          <SalesChart />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}; 