import React, { useEffect, useState } from 'react';
import { Form, Input, Checkbox, Card, Row, Col } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import type { PermissionProfile } from '../types/types';
import type { CreatePermissionProfileDto, UpdatePermissionProfileDto } from '../types/types';
import { useTranslation } from "react-i18next";


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
    name_en: 'Super Admin', 
    name_ar: '', 
    code: 'SUPER_ADMIN', 
    description_en: 'Full system access', 
    description_ar: '', 
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_DELETE', 'SETTINGS_MANAGE', 'REPORTS_VIEW', 'DATA_EXPORT'] 
  },
  { 
    id: 2, 
    name_en: 'HR Manager', 
    name_ar: '', 
    code: 'HR_MANAGER', 
    description_en: 'Can manage users and work hours', 
    description_ar: '', 
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'WORKHOURS_MANAGE'] 
  },
  { 
    id: 3, 
    name_en: 'Viewer', 
    name_ar: '', 
    code: 'VIEWER_ONLY', 
    description_en: 'Read-only access', 
    description_ar: '', 
    permissions: ['USER_VIEW', 'REPORTS_VIEW'] 
  },
];



const mockPermissionService = {
  getAll: async (): Promise<PermissionProfile[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(STATIC_PROFILES), 500));
  },
  create: async (data: CreatePermissionProfileDto): Promise<PermissionProfile> => {
    console.log('Mock Create Profile:', data);
    const newProfile = { 
      ...data, 
      id: Date.now(),
      name_ar: data.name_ar || '', 
      description_en: data.description_en || '',
      description_ar: data.description_ar || '',
    } as PermissionProfile;
    return Promise.resolve(newProfile);
  },
  update: async (id: string | number, data: UpdatePermissionProfileDto): Promise<PermissionProfile> => {
    console.log('Mock Update Profile:', id, data);
    const profile = STATIC_PROFILES.find(p => p.id === id);
    const updated = { 
      ...profile, 
      ...data, 
      id,
      name_ar: data.name_ar || profile?.name_ar || '',
      description_en: data.description_en || profile?.description_en || '',
      description_ar: data.description_ar || profile?.description_ar || '',
    } as PermissionProfile;
    return Promise.resolve(updated);
  },
  delete: async (id: string | number): Promise<void> => {
    console.log('Mock Delete Profile:', id);
    return Promise.resolve();
  },
};

const PermissionsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<PermissionProfile, CreatePermissionProfileDto, UpdatePermissionProfileDto>({
    queryKey: ['permissionProfiles'],
    fetchFn: mockPermissionService.getAll,
    createFn: mockPermissionService.create,
    updateFn: ({ id, data }) => mockPermissionService.update(id, data),
    deleteFn: mockPermissionService.delete,
  });

  useEffect(() => {
    const loadLockups = async () => {
      setAvailablePermissions(STATIC_AVAILABLE_PERMISSIONS);
    };
    loadLockups();
  }, []);

  const columns = [
    { title: 'Profile Name', dataIndex: 'name_en', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' }, 
    { title: 'Description', dataIndex: 'description_en', key: 'description' },
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name_en" 
        label="Profile Name (English)" 
        rules={[{ required: true, message: t("required") },
        { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") }]}
      >
        <Input placeholder="e.g. HR Manager" />
      </Form.Item>

      <Form.Item 
        name="name_ar" 
        label={t("name_ar")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
      >
        <Input placeholder="مدير الموارد البشرية" style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Form.Item 
        name="code" 
        label="Unique Code" 
        rules={[{ required: true, message: 'Code is required' }]}
      >
        <Input placeholder="e.g. HR_MANAGER" style={{ textTransform: 'uppercase' }} />
      </Form.Item>

      <Form.Item 
        name="description_en" 
        label={t("description_en")}
        rules={[
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") },
        ]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item 
        name="description_ar" 
        label={t("description_ar")}
        rules={[
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
      >
        <Input.TextArea rows={3} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Card title="Assign Permissions" size="small" style={{ marginTop: 20 }}>
        <Form.Item 
          name="permissions" 
          rules={[{ required: true, message: 'Select at least one permission' }]}
        >
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
      title="Permission Profiles (Test Mode)"
      columns={columns}
      formItems={formItems}
      data={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
    />
  );
};

export default PermissionsPage;