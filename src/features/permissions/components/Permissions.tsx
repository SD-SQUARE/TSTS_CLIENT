import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Form, Input, Select, Space, Table, Tag, Tooltip } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import api from '../../../api/http';
import { permissionApi } from '../services/permissionsApi';
import type {
  CreatePermissionProfileDto,
  PermissionProfile,
  PermissionProfilePermission,
  SystemPermission,
  UpdatePermissionProfileDto,
} from '../types/types';
import { useTranslation } from 'react-i18next';

const PermissionPicker: React.FC<{
  mode: 'create' | 'edit';
  systemPermissions: SystemPermission[];
}> = ({ systemPermissions }) => {
  const { t, i18n } = useTranslation();
  const form = Form.useFormInstance();
  const selectedPermissions =
    (Form.useWatch('additional_names', form) as PermissionProfilePermission[] | undefined) || [];

  const selectedKeys = useMemo(
    () =>
      new Set(
        selectedPermissions.map(
          (permission) =>
            permission.key || `${permission.name_en || ''}::${permission.name_ar || ''}`,
        ),
      ),
    [selectedPermissions],
  );

  const availableOptions = useMemo(
    () =>
      systemPermissions
        .filter(
          (permission) =>
            !selectedKeys.has(
              permission.key || `${permission.name_en || ''}::${permission.name_ar || ''}`,
            ),
        )
        .map((permission) => ({
          value: permission.key || String(permission.id),
          label:
            i18n.language === 'ar'
              ? permission.name_ar || permission.name_en
              : permission.name_en || permission.name_ar,
          permission,
        })),
    [i18n.language, selectedKeys, systemPermissions],
  );

  return (
    <Card title={t('user_list.perm_title')} size="small" style={{ marginTop: 20 }}>
      <Form.List name="additional_names">
        {(fields, { add, remove }) => {
          const handleSelectPermission = (value: string) => {
            const selected = systemPermissions.find(
              (permission) => (permission.key || String(permission.id)) === value,
            );

            if (!selected) {
              return;
            }

            add({
              key: selected.key,
              name_en: selected.name_en,
              name_ar: selected.name_ar,
            });
          };

          return (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                placeholder={t('permissionsPage.select_existing_permissions')}
                options={availableOptions}
                onSelect={handleSelectPermission}
                value={undefined}
              />

              {fields.length ? (
                <Space size={[8, 8]} wrap>
                  {fields.map(({ key, name }) => {
                    const permission = selectedPermissions[name];
                    const label =
                      i18n.language === 'ar'
                        ? permission?.name_ar || permission?.name_en
                        : permission?.name_en || permission?.name_ar;

                    return (
                      <Tag
                        key={key}
                        color="blue"
                        closable
                        onClose={() => remove(name)}
                        style={{ paddingInline: 10, paddingBlock: 6 }}
                      >
                        {label}
                      </Tag>
                    );
                  })}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('permissionsPage.no_permissions')}
                />
              )}
            </Space>
          );
        }}
      </Form.List>
    </Card>
  );
};

const PermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  const permissionsLookupQuery = useQuery<SystemPermission[]>({
    queryKey: ['system-permissions'],
    queryFn: async () => {
      const { data } = await api.get('/v1/lockups/permissions/system');
      return data.permissions || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data,
    total,
    isLoading,
    useGetOne,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<PermissionProfile, CreatePermissionProfileDto, UpdatePermissionProfileDto>({
    queryKey: ['permissionProfiles', searchTerm, pagination.current, pagination.pageSize],

    fetchFn: () =>
      permissionApi.getAll({
        name: searchTerm,
        page_index: pagination.current,
        page_size: pagination.pageSize,
      }),
    fetchOneFn: (id) => permissionApi.getById(id),
    createFn: (values: any) => {
      const payload = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        description_en: values.description_en,
        description_ar: values.description_ar,
        permissions: values.additional_names || [],
      };
      return permissionApi.create(payload as CreatePermissionProfileDto);
    },

    updateFn: ({ id, data: values }: any) => {
      const payload = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        description_en: values.description_en,
        description_ar: values.description_ar,
        permissions: values.additional_names || [],
      };
      return permissionApi.update(id, payload as UpdatePermissionProfileDto);
    },

    deleteFn: (id) => permissionApi.delete(id),
  });

  const columns = [
    { title: t('name_en'), dataIndex: 'name_en', key: 'name_en' },
    { title: t('name_ar'), dataIndex: 'name_ar', key: 'name_ar' },
    {
      title: t('description_en'),
      dataIndex: 'description_en',
      key: 'description_en',
      render: (text: string) => (
        <Tooltip title={text}>
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: t('description_ar'),
      dataIndex: 'description_ar',
      key: 'description_ar',
      render: (text: string) => (
        <Tooltip title={text}>
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              direction: 'rtl',
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
  ];

  const renderViewExtra = (record: PermissionProfile) => {
    if (!record || !record.permissions || record.permissions.length === 0) return null;

    const innerColumns = [
      { title: t('name_en'), dataIndex: 'name_en', key: 'name_en' },
      { title: t('name_ar'), dataIndex: 'name_ar', key: 'name_ar' },
      { title: t('permissions'), dataIndex: 'key', key: 'key' },
    ];

    return (
      <Card bordered={false} className="admin-card">
        <Table
          dataSource={record.permissions}
          columns={innerColumns}
          pagination={false}
          size="middle"
          rowKey={(row) => row.key || `${row.name_en}-${row.name_ar}`}
          bordered
        />
      </Card>
    );
  };

  const renderBaseFormItems = () => (
    <>
      <Form.Item
        name="name_en"
        label={t('name_en')}
        rules={[
          { required: true, message: t('required') },
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t('english_only') },
        ]}
      >
        <Input placeholder="e.g. HR Manager" />
      </Form.Item>

      <Form.Item
        name="name_ar"
        label={t('name_ar')}
        rules={[
          { required: true, message: t('required') },
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t('arabic_only') },
        ]}
      >
        <Input
          placeholder="مدير الموارد البشرية"
          style={{ direction: 'rtl', textAlign: 'right' }}
        />
      </Form.Item>

      <Form.Item
        name="description_en"
        label={t('description_en')}
        rules={[{ pattern: /^[A-Za-z0-9\s.,-]*$/, message: t('english_only') }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        name="description_ar"
        label={t('description_ar')}
        rules={[{ pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t('arabic_only') }]}
      >
        <Input.TextArea rows={3} style={{ direction: 'rtl', textAlign: 'right' }} />
      </Form.Item>
    </>
  );

  const nestedFieldMappers = {
    additional_names: (record: PermissionProfile) => record.permissions || [],
  };

  return (
    <GenericCrudPage<PermissionProfile>
      title={t('user_list.perm_prof')}
      columns={columns}
      formItems={renderBaseFormItems()}
      renderFormItems={({ mode }) => (
        <>
          {renderBaseFormItems()}
          <PermissionPicker
            mode={mode}
            systemPermissions={permissionsLookupQuery.data || []}
          />
        </>
      )}
      data={data ?? []}
      total={total}
      isLoading={isLoading}
      pageIndex={pagination.current}
      pageSize={pagination.pageSize}
      onPageChange={(page, size) => setPagination({ current: page, pageSize: size })}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      searchText={searchTerm}
      onSearch={(value) => {
        setSearchTerm(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
      }}
      viewExtraNode={renderViewExtra}
      nestedFieldMappers={nestedFieldMappers}
      useGetOne={useGetOne}
    />
  );
};

export default PermissionsPage;
