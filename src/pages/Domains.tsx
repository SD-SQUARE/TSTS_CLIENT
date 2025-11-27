import React from 'react';
import { Form, Input, Select, Tag } from 'antd';
import { GenericCrudPage } from '../components/GenericCrudPage';
import type { Domain } from '../types';
// import { domainApi } from '../services/api'; // commented for now



const MOCK_UNIVERSITIES = [
  { label: 'Cairo University', value: 1 },
  { label: 'Ain Shams University', value: 2 },
  { label: 'Helwan University', value: 3 },
];

const STATIC_DOMAINS: Domain[] = [
  { 
    id: 10, 
    name: 'Engineering', 
    description: 'Faculty of Engineering', 
    universityId: 1 // cairo Uni
  },
  { 
    id: 11, 
    name: 'Medicine', 
    description: 'Faculty of Medicine', 
    universityId: 1 // cairo Uni
  },
  { 
    id: 20, 
    name: 'Business & Commerce', 
    description: 'Faculty of Commerce', 
    universityId: 2 // ain Shams
  },
  { 
    id: 30, 
    name: 'Fine Arts', 
    description: 'Faculty of Fine Arts', 
    universityId: 3 // helwan
  },
];


const mockService = {
  getAll: async () => {
    return new Promise<Domain[]>((resolve) => {
      setTimeout(() => resolve(STATIC_DOMAINS), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create Domain:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update Domain:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete Domain:', id);
    return Promise.resolve();
  }
} as any;

const DomainsPage: React.FC = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'University', 
      dataIndex: 'universityId', 
      key: 'uni',
      render: (uniId: number) => {
        const uni = MOCK_UNIVERSITIES.find(u => u.value === uniId);
        return uni ? <Tag color="geekblue">{uni.label}</Tag> : uniId;
      }
    }, 
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name" 
        label="Name" 
        rules={[{ required: true, message: 'Please enter domain name' }]}
      >
        <Input placeholder="e.g. Engineering" />
      </Form.Item>
      
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="e.g. Faculty details..." />
      </Form.Item>
      
      <Form.Item 
        name="universityId" 
        label="University" 
        rules={[{ required: true, message: 'Please select a university' }]}
      >
        <Select 
          placeholder="Select University"
          options={MOCK_UNIVERSITIES} 
        />
      </Form.Item>
    </>
  );

  return (
    <GenericCrudPage<Domain>
      title="Domains (Test Mode)"
      service={mockService} 
      columns={columns}
      formItems={formItems}
    />
  );
};

export default DomainsPage;