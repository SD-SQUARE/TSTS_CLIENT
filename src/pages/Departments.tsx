import React, { useState } from 'react';
import { Form, Input, Select, Tag } from 'antd';
import { GenericCrudPage } from '../components/GenericCrudPage';
import type { Department } from '../types';
// import { departmentApi } from '../services/api'; // commented for now


const MOCK_UNIVERSITIES = [
  { label: 'Cairo University', value: 1 },
  { label: 'Ain Shams University', value: 2 },
  { label: 'Helwan University', value: 3 },
];

const MOCK_DOMAINS = [
  { label: 'Engineering', value: 10, uniId: 1 },
  { label: 'Medicine', value: 11, uniId: 1 },
  { label: 'Business', value: 20, uniId: 2 },
  { label: 'Arts', value: 21, uniId: 2 },
];


const STATIC_DEPARTMENTS: Department[] = [
  { 
    id: 101, 
    name: 'Computer Engineering', 
    description: 'Hardware and Software integration', 
    universityId: 1, // cairo Uni
    domainId: 10     // engineering
  },
  { 
    id: 102, 
    name: 'General Surgery', 
    description: 'Surgical procedures dept', 
    universityId: 1, // cairo Uni
    domainId: 11     // medicine
  },
  { 
    id: 201, 
    name: 'Accounting', 
    description: 'Financial records', 
    universityId: 2, // ain Shams
    domainId: 20     // business
  },
];


const mockService = {
  getAll: async () => {
    return new Promise<Department[]>((resolve) => {
      setTimeout(() => resolve(STATIC_DEPARTMENTS), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create Dept:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update Dept:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete Dept:', id);
    return Promise.resolve();
  }
} as any;

const DepartmentsPage: React.FC = () => {
  const [selectedUni, setSelectedUni] = useState<number | null>(null);

  const filteredDomains = MOCK_DOMAINS.filter(d => d.uniId === selectedUni);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'University', 
      dataIndex: 'universityId',
      key: 'uni',
      render: (id: number) => {
        const uni = MOCK_UNIVERSITIES.find(u => u.value === id);
        return uni ? <Tag color="geekblue">{uni.label}</Tag> : id;
      }
    },
    { 
      title: 'Domain', 
      dataIndex: 'domainId',
      key: 'domain',
      render: (id: number) => {
        const domain = MOCK_DOMAINS.find(d => d.value === id);
        return domain ? <Tag color="purple">{domain.label}</Tag> : id;
      }
    },
  ];

  const formItems = (
    <>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input placeholder="e.g. Computer Engineering" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      
      <Form.Item name="universityId" label="University" rules={[{ required: true }]}>
        <Select 
          placeholder="Select University"
          options={MOCK_UNIVERSITIES} 
          onChange={(val) => {
            setSelectedUni(val);
            //  reset domain when university changes (may do)
            // form.setFieldValue('domainId', null); 
          }} 
        />
      </Form.Item>

      <Form.Item name="domainId" label="Domain" rules={[{ required: true }]}>
        <Select 
          placeholder={!selectedUni ? "Select University first" : "Select Domain"}
          options={filteredDomains} 
          disabled={!selectedUni} 
        />
      </Form.Item>
    </>
  );

  return (
    <GenericCrudPage<Department>
      title="Departments (Test Mode)"
      service={mockService}
      columns={columns}
      formItems={formItems}
    />
  );
};

export default DepartmentsPage;