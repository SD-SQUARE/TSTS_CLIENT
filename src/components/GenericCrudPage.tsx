import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { BaseCrudService } from '../features/profile/services/api';

interface GenericCrudProps<T> {
  title: string;
  service: BaseCrudService<T>; 
  columns: ColumnsType<T>;     
  formItems: React.ReactNode;  

  disableAdd?: boolean; 
}

export const GenericCrudPage = <T extends { id: string | number }>({
  title,
  service,
  columns,
  formItems,
  disableAdd = false,
}: GenericCrudProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await service.getAll();
      setData(result); 
    } catch (error) {
      console.error(error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [service]);

  const handleOk = async () => {
    try {
      let values = await form.validateFields();


      setLoading(true); 
      if (editingItem) {
        await service.update(editingItem.id, values);
        message.success('Updated successfully');
      } else {
        await service.create(values);
        message.success('Created successfully');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchData(); 
    } catch (error) {
      console.error('Validation or API error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await service.delete(id);
      message.success('Deleted successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Delete failed');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: T) => {
    setEditingItem(record);
    setIsModalOpen(true);
  };

  const tableColumns: ColumnsType<T> = [
    ...columns,
    {
      title: 'Operations',
      key: 'actions',
      width: 120, 
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#faad14' }} />} 
            onClick={() => openEditModal(record)} 
          />
          <Popconfirm 
            title="Are you sure you want to delete this?" 
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div 
        className="page-header-row" 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
      >
        <h2 className="page-title">{title}</h2>
        
        {!disableAdd && (
          <Button 
            // type="primary"
            style={{backgroundColor:'#cad8ec'}} 
            icon={<PlusOutlined />} 
            onClick={openAddModal}
            size="large"
            className="add-button"
          >
            Add {title}
          </Button>
        )}
      </div>

      <div className="admin-card">
        <Table 
          columns={tableColumns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 800 }} 
          pagination={{ 
            position: ['bottomRight'],
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
        />
      </div>

      <Modal
        title={editingItem ? `Edit ${title}` : `Add ${title}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingItem ? "Save Changes" : "Create"}
        cancelText="Cancel"
        width={600} 
        centered  
        confirmLoading={loading}
      >
        <Form 
          form={form} 
          layout="vertical" 
          style={{ marginTop: 20 }}
        >
          {formItems}
        </Form>
      </Modal>
    </div>
  );
};