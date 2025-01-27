import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SalesData } from '../../types/dashboard';

interface Props {
  data: SalesData[];
}

export const DashboardChart: React.FC<Props> = ({ data }) => {
  return (
    <Card title="Pregled prodaje">
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
          name="Iznos"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="orders"
          stroke="#82ca9d"
          name="Broj narudžbi"
        />
      </LineChart>
    </Card>
  );
}; 