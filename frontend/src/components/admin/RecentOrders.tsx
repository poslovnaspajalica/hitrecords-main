import React from 'react';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export const RecentOrders = () => {
  const orders: Order[] = [
    {
      id: '1',
      customer: 'John Doe',
      total: 99.99,
      status: 'Processing',
      date: '2024-01-20'
    },
    // Dodaj još primjera...
  ];

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/admin/orders/${order.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  #{order.id}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${order.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 