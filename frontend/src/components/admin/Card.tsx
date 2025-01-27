import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface CardProps {
  title: string;
  value: string;
  change: string;
  type: 'positive' | 'negative';
}

export const Card = ({ title, value, change, type }: CardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`ml-2 flex items-baseline text-sm font-semibold ${
          type === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {type === 'positive' ? (
            <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
          )}
          <span className="ml-1">{change}</span>
        </p>
      </div>
    </div>
  );
}; 