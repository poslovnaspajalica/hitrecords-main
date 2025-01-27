import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const ProductsManager: React.FC = () => {
  const columns = [
    {
      title: 'Naziv',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cijena',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toFixed(2)} €`
    },
    {
      title: 'Stanje',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Akcije',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => console.log('Edit:', record)}>
            Uredi
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => console.log('Delete:', record)}>
            Obriši
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Upravljanje proizvodima</h1>
      <Button type="primary" style={{ marginBottom: 16 }}>
        Dodaj novi proizvod
      </Button>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
}; 