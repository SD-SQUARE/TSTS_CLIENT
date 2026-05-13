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
import {
  getServerTextFilterProps,
} from '../../../components/table/serverFilters';
import { ARABIC_TEXT_PATTERN, ENGLISH_TEXT_PATTERN } from '../../../utils/validationPatterns';

const normalizePermissionValue = (
  permission: Partial<PermissionProfilePermission> & {
    name?: { en?: string; ar?: string };
  },
): PermissionProfilePermission => ({
  key: permission.key,
  name_en: permission.name_en || permission.name?.en || '',
  name_ar: permission.name_ar || permission.name?.ar || '',
});

const PermissionPicker: React.FC<{
  mode: 'create' | 'edit';
  systemPermissions: SystemPermission[];
}> = ({ systemPermissions }) => {
  const { t, i18n } = useTranslation();
  const form = Form.useFormInstance();
  const selectedPermissions = (
    (Form.useWatch('additional_names', form) as PermissionProfilePermission[] | undefined) || []
  ).map(normalizePermissionValue);

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
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Select
          showSearch
          allowClear
          optionFilterProp="label"
          placeholder={t('permissionsPage.select_existing_permissions')}
          options={availableOptions}
          onSelect={(value) => {
            const selected = systemPermissions.find(
              (permission) => (permission.key || String(permission.id)) === value,
            );

            if (!selected) {
              return;
            }

            form.setFieldValue('additional_names', [
              ...selectedPermissions,
              normalizePermissionValue(selected),
            ]);
          }}
          value={undefined}
        />

        {selectedPermissions.length ? (
          <Space size={[8, 8]} wrap>
            {selectedPermissions.map((permission, index) => {
              const label =
                i18n.language === 'ar'
                  ? permission.name_ar || permission.name_en
                  : permission.name_en || permission.name_ar;

              return (
                <Tag
                  key={permission.key || `${permission.name_en}-${permission.name_ar}-${index}`}
                  color="blue"
                  closable
                  onClose={() =>
                    form.setFieldValue(
                      'additional_names',
                      selectedPermissions.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
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
      <Form.Item name="additional_names" hidden>
        <Input />
      </Form.Item>
    </Card>
  );
};

const PermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  const [filters, setFilters] = useState({
    name_en: undefined as string | undefined,
    name_ar: undefined as string | undefined,
    description_en: undefined as string | undefined,
    description_ar: undefined as string | undefined,
    permission_name: undefined as string | undefined,
  });

  const resetToFirstPage = () =>
    setPagination((prev) => ({ ...prev, current: 1 }));

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
    queryKey: ['permissionProfiles', filters, pagination.current, pagination.pageSize],

    fetchFn: () =>
      permissionApi.getAll({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
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
    {
      title: t('name_en'),
      dataIndex: 'name_en',
      key: 'name_en',
      ...getServerTextFilterProps({
        filterKey: 'name_en',
        filters,
        setFilters,
        placeholder: `${t('common.search')} ${t('name_en')}`,
        onChange: resetToFirstPage,
      }),
    },
    {
      title: t('name_ar'),
      dataIndex: 'name_ar',
      key: 'name_ar',
      ...getServerTextFilterProps({
        filterKey: 'name_ar',
        filters,
        setFilters,
        placeholder: `${t('common.search')} ${t('name_ar')}`,
        onChange: resetToFirstPage,
      }),
    },
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
      ...getServerTextFilterProps({
        filterKey: 'description_en',
        filters,
        setFilters,
        placeholder: `${t('common.search')} ${t('description_en')}`,
        onChange: resetToFirstPage,
      }),
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
      ...getServerTextFilterProps({
        filterKey: 'description_ar',
        filters,
        setFilters,
        placeholder: `${t('common.search')} ${t('description_ar')}`,
        onChange: resetToFirstPage,
      }),
    },
    {
      title: t('permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: PermissionProfilePermission[] | undefined) => {
        if (!permissions?.length) {
          return '-';
        }

        return (
          <Tooltip
            title={permissions
              .map((permission) => permission.name_en || permission.name_ar || permission.key)
              .join(', ')}
          >
            <div
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
              }}
            >
              {permissions
                .map((permission) => permission.name_en || permission.name_ar || permission.key)
                .join(', ')}
            </div>
          </Tooltip>
        );
      },
      ...getServerTextFilterProps({
        filterKey: 'permission_name',
        filters,
        setFilters,
        placeholder: `${t('common.search')} ${t('permissions')}`,
        onChange: resetToFirstPage,
      }),
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
          { pattern: ENGLISH_TEXT_PATTERN, message: t('english_only') },
        ]}
      >
        <Input placeholder="e.g. HR Manager" />
      </Form.Item>

      <Form.Item
        name="name_ar"
        label={t('name_ar')}
        rules={[
          { required: true, message: t('required') },
          { pattern: ARABIC_TEXT_PATTERN, message: t('arabic_only') },
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
        rules={[{ pattern: ENGLISH_TEXT_PATTERN, message: t('english_only') }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        name="description_ar"
        label={t('description_ar')}
        rules={[{ pattern: ARABIC_TEXT_PATTERN, message: t('arabic_only') }]}
      >
        <Input.TextArea rows={3} style={{ direction: 'rtl', textAlign: 'right' }} />
      </Form.Item>
    </>
  );

  const nestedFieldMappers = {
    additional_names: (record: PermissionProfile) =>
      (record.permissions || []).map(normalizePermissionValue),
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
      showToolbarSearch={false}
      viewExtraNode={renderViewExtra}
      nestedFieldMappers={nestedFieldMappers}
      useGetOne={useGetOne}
    />
  );
};

export default PermissionsPage;
