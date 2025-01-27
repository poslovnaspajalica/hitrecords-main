import React from 'react';
import { Form, Input, Button, Card, Switch } from 'antd';

export const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div>
      <h1>Postavke</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            siteName: 'Hit Records Shop',
            emailNotifications: true,
            maintenanceMode: false
          }}
        >
          <Form.Item
            name="siteName"
            label="Naziv stranice"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="emailNotifications"
            label="Email obavijesti"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="maintenanceMode"
            label="Način održavanja"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Spremi promjene
          </Button>
        </Form>
      </Card>
    </div>
  );
}; 