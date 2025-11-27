import React from 'react';
import { Form, Input } from 'antd';
import { GenericCrudPage } from '../components/GenericCrudPage';
import type { University } from '../types';
// import { universityApi } from '../services/api'; // commented for now


const STATIC_UNIVERSITIES: University[] = [
  { 
    id: 1, 
    name: 'Cairo University', 
    description: 'Premier public university in Giza, Egypt.' 
  },
  { 
    id: 2, 
    name: 'Ain Shams University', 
    description: 'Major public university located in Cairo.' 
  },
  { 
    id: 3, 
    name: 'American University in Cairo', 
    description: 'Private research university in New Cairo.' 
  },
  { 
    id: 4, 
    name: 'Helwan University', 
    description: 'Public university focused on technology and arts.' 
  },
];

const mockService = {
  getAll: async () => {
    return new Promise<University[]>((resolve) => {
      setTimeout(() => resolve(STATIC_UNIVERSITIES), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create Uni:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update Uni:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete Uni:', id);
    return Promise.resolve();
  }
} as any;

const UniversitiesPage: React.FC = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name" 
        label="Name" 
        rules={[{ required: true, message: 'University name is required' }]}
      >
        <Input placeholder="e.g. Cairo University" />
      </Form.Item>
      
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Enter description..." rows={4} />
      </Form.Item>
    </>
  );

  return (
    <GenericCrudPage<University>
      title="Universities (Test Mode)"
      service={mockService} 
      columns={columns}
      formItems={formItems}
    />
  );
};

export default UniversitiesPage;