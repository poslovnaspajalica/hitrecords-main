import React from 'react';
import { Table, Tag, Button } from 'antd';

export const OrdersManager: React.FC = () => {
  const columns = [
    {
      title: 'ID Narudžbe',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Kupac',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'gold' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Ukupno',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `${total.toFixed(2)} €`
    },
    {
      title: 'Akcije',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button onClick={() => console.log('View details:', record)}>
          Detalji
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Upravljanje narudžbama</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
}; 