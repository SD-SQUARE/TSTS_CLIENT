import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Tag } from 'antd';
import { GenericCrudPage } from '../components/GenericCrudPage';
// import { specializationApi, departmentApi } from '../services/api'; // commented for now 
import type { Specialization, Department } from '../types';


const STATIC_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Computer Science', universityId: 1, domainId: 1 },
  { id: 2, name: 'Civil Engineering', universityId: 1, domainId: 1 },
  { id: 3, name: 'Business Administration', universityId: 2, domainId: 2 },
  { id: 4, name: 'Medicine', universityId: 2, domainId: 3 },
];

const STATIC_SPECIALIZATIONS: Specialization[] = [
  { 
    id: 101, 
    name: 'Artificial Intelligence', 
    description: 'Focus on ML and Neural Networks', 
    departmentId: 1 //Computer Science
  },
  { 
    id: 102, 
    name: 'Cyber Security', 
    description: 'Network security and cryptography', 
    departmentId: 1 //Computer Science
  },
  { 
    id: 201, 
    name: 'Structural Engineering', 
    description: 'Building stability analysis', 
    departmentId: 2 // civil Eng
  },
  { 
    id: 301, 
    name: 'Digital Marketing', 
    description: 'SEO and Social Media', 
    departmentId: 3 // business
  },
];

const mockService = {
  getAll: async () => {
    return new Promise<Specialization[]>((resolve) => {
      setTimeout(() => resolve(STATIC_SPECIALIZATIONS), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create Spec:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update Spec:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete Spec:', id);
    return Promise.resolve();
  }
} as any;

const SpecializationsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        // const data = await departmentApi.getAll(); 
        setDepartments(STATIC_DEPARTMENTS);
      } catch (error) {
        console.error("Failed to load departments", error);
      }
    };
    loadDepts();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Department', 
      dataIndex: 'departmentId', 
      key: 'dept',
      render: (deptId: number) => {
        const dept = departments.find(d => d.id === deptId);
        return dept ? <Tag color="geekblue">{dept.name}</Tag> : deptId;
      }
    }, 
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name" 
        label="Name" 
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="e.g. Artificial Intelligence" />
      </Form.Item>
      
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Enter specialization details..." />
      </Form.Item>

      <Form.Item 
        name="departmentId" 
        label="Department" 
        rules={[{ required: true, message: 'Please select a department' }]}
      >
        <Select 
          placeholder="Select Department"
          options={departments.map(d => ({ label: d.name, value: d.id }))}
        />
      </Form.Item>
    </>
  );

  return (
    <GenericCrudPage<Specialization>
      title="Specializations (Test Mode)"
      service={mockService} 
      columns={columns}
      formItems={formItems}
    />
  );
};

export default SpecializationsPage;