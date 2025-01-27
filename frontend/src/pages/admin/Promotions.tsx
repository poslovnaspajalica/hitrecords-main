import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import { usePromotions } from '../../hooks/usePromotions';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const Promotions: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const { promotions, loading, createPromotion, updatePromotion, deletePromotion } = usePromotions();

  const columns = [
    {
      title: 'Naziv',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => ({
        percentage: 'Postotak',
        fixed: 'Fiksni iznos',
        bogo: 'Kupi 1 dobiješ 1',
      }[type]),
    },
    {
      title: 'Vrijednost',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: any) => 
        record.type === 'percentage' ? `${value}%` : `${value}€`,
    },
    {
      title: 'Aktivno od',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Aktivno do',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => {
        const now = new Date();
        const start = new Date(record.startDate);
        const end = new Date(record.endDate);
        return now >= start && now <= end ? 'Aktivno' : 'Neaktivno';
      },
    },
    {
      title: 'Akcije',
      key: 'actions',
      render: (record: any) => (
        <>
          <Button onClick={() => handleEdit(record)}>Uredi</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Obriši</Button>
        </>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    if (values.id) {
      await updatePromotion(values.id, values);
    } else {
      await createPromotion(values);
    }
    setModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (record: any) => {
    // Implementacija edit funkcije
    console.log('Editing:', record);
  };

  const handleDelete = (id: string) => {
    // Implementacija delete funkcije
    console.log('Deleting:', id);
  };

  return (
    <div className="promotions-page">
      <div className="page-header">
        <h1>Promocije i popusti</h1>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Nova promocija
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="Promocija"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Naziv"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Tip popusta"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="percentage">Postotak</Option>
              <Option value="fixed">Fiksni iznos</Option>
              <Option value="bogo">Kupi 1 dobiješ 1</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Vrijednost"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Period"
            rules={[{ required: true }]}
          >
            <RangePicker showTime />
          </Form.Item>

          <Form.Item
            name="minPurchase"
            label="Minimalna kupovina"
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            name="maxUses"
            label="Maksimalan broj korištenja"
          >
            <InputNumber min={0} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Spremi
          </Button>
        </Form>
      </Modal>
    </div>
  );
}; 