import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const onFinish = async (values: { email: string; password: string }) => {
    const success = await login(values.email, values.password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      message.error('Neuspješna prijava. Provjerite email i lozinku.');
    }
  };

  return (
    <div className="login-page">
      <Card title="Prijava u administraciju" style={{ width: 400 }}>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Unesite email' },
              { type: 'email', message: 'Unesite ispravan email' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Unesite lozinku' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Lozinka" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Prijava
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}; 