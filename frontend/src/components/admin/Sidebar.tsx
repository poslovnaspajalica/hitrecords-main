import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  UsersIcon, 
  CogIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export const Sidebar = () => {
  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: ChartBarIcon
    },
    {
      path: '/admin/products',
      name: 'Products',
      icon: ShoppingBagIcon
    },
    {
      path: '/admin/orders',
      name: 'Orders',
      icon: ShoppingBagIcon
    },
    {
      path: '/admin/shipping',
      name: 'Shipping',
      icon: TruckIcon
    },
    {
      path: '/admin/users',
      name: 'Users',
      icon: UsersIcon
    },
    {
      path: '/admin/settings',
      name: 'Settings',
      icon: CogIcon
    }
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}; 