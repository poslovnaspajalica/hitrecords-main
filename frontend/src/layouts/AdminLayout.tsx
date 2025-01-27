import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  TagOutlined,
  OrderedListOutlined,
  UserOutlined,
  SettingOutlined,
  HomeOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Provjera je li korisnik admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShopOutlined />,
      label: <Link to="/admin/products">Proizvodi</Link>,
    },
    {
      key: '/admin/promotions',
      icon: <TagOutlined />,
      label: <Link to="/admin/promotions">Promocije</Link>,
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: <Link to="/admin/orders">Narudžbe</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Korisnici</Link>,
    },
    {
      key: '/admin/homepage',
      icon: <HomeOutlined />,
      label: <Link to="/admin/homepage">Početna stranica</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">Postavke</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div className="logo">
          <h2>Hit Music Admin</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <div style={{ float: 'right' }}>
            <span style={{ marginRight: 16 }}>
              {user.email}
            </span>
            <LogoutOutlined onClick={logout} style={{ cursor: 'pointer' }} />
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}; 