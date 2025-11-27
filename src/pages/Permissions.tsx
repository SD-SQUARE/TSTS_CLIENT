import React, { useEffect, useState } from 'react';
import { Form, Input, Checkbox, Card, Row, Col, Typography } from 'antd';
import { GenericCrudPage } from '../components/GenericCrudPage';
// import { permissionApi } from '../services/api'; // commented for now (api)
// import axiosInstance from '../services/api';     // commented for now (axios)
// import { API_ROUTES_PATHS, PATH_NAMES } from '../app/route.helper';
import type { PermissionProfile } from '../types';

const { Text } = Typography;


const STATIC_AVAILABLE_PERMISSIONS = [
  { label: 'View Users', value: 'USER_VIEW' },
  { label: 'Create Users', value: 'USER_CREATE' },
  { label: 'Edit Users', value: 'USER_EDIT' },
  { label: 'Delete Users', value: 'USER_DELETE' },
  { label: 'Manage Settings', value: 'SETTINGS_MANAGE' },
  { label: 'View Reports', value: 'REPORTS_VIEW' },
  { label: 'Export Data', value: 'DATA_EXPORT' },
  { label: 'Manage Work Hours', value: 'WORKHOURS_MANAGE' },
];

const STATIC_PROFILES: PermissionProfile[] = [
  { 
    id: 1, 
    name: 'Super Admin', 
    code: 'SUPER_ADMIN', 
    description: 'Full system access', 
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_DELETE', 'SETTINGS_MANAGE', 'REPORTS_VIEW', 'DATA_EXPORT'] 
  },
  { 
    id: 2, 
    name: 'HR Manager', 
    code: 'HR_MANAGER', 
    description: 'Can manage users and work hours', 
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'WORKHOURS_MANAGE'] 
  },
  { 
    id: 3, 
    name: 'Viewer', 
    code: 'VIEWER_ONLY', 
    description: 'Read-only access', 
    permissions: ['USER_VIEW', 'REPORTS_VIEW'] 
  },
];


const mockService = {
  getAll: async () => {
    return new Promise<PermissionProfile[]>((resolve) => {
      setTimeout(() => resolve(STATIC_PROFILES), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create Profile:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update Profile:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete Profile:', id);
    return Promise.resolve();
  }
} as any;

const PermissionsPage: React.FC = () => {
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);

  useEffect(() => {
    const loadLockups = async () => {
        setAvailablePermissions(STATIC_AVAILABLE_PERMISSIONS);
    };
    loadLockups();
  }, []);

  const columns = [
    { title: 'Profile Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' }, 
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name" 
        label="Profile Name" 
        rules={[{ required: true, message: 'Profile name is required' }]}
      >
        <Input placeholder="e.g. HR Manager" />
      </Form.Item>

      <Form.Item 
        name="code" 
        label="Unique Code" 
        rules={[{ required: true, message: 'Code is required' }]}
      >
        <Input placeholder="e.g. HR_MANAGER" style={{ textTransform: 'uppercase'}} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>

      <Card title="Assign Permissions" size="small" style={{ marginTop: 20 }}>
        <Form.Item name="permissions">
           <Checkbox.Group style={{ width: '100%' }}>
             <Row gutter={[16, 16]}>
               {availablePermissions.map((perm) => (
                 <Col span={12} key={perm.value}>
                   <Checkbox value={perm.value}>{perm.label}</Checkbox>
                 </Col>
               ))}
             </Row>
           </Checkbox.Group>
        </Form.Item>
      </Card>
    </>
  );

  return (
    <GenericCrudPage<PermissionProfile>
      title="Permission  (Test Mode)"
      service={mockService} 
      columns={columns}
      formItems={formItems}
    />
  );
};

export default PermissionsPage;