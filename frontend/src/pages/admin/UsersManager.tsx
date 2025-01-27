import React from 'react';
import { Table, Button, Switch } from 'antd';

export const UsersManager: React.FC = () => {
  const columns = [
    {
      title: 'Ime',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Prezime',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Aktivan',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} />
      ),
    },
    {
      title: 'Akcije',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button onClick={() => console.log('Edit user:', record)}>
          Uredi
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Upravljanje korisnicima</h1>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
}; 