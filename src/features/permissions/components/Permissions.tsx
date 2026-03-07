import React, { useState } from 'react';
import { Form, Input, Card, Button, Space, Table, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { permissionApi } from '../services/permissionsApi';
import type { PermissionProfile } from '../types/types';
import type { CreatePermissionProfileDto, UpdatePermissionProfileDto } from '../types/types';
import { useTranslation } from "react-i18next";

const PermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  const {
    data,
    total,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<PermissionProfile, CreatePermissionProfileDto, UpdatePermissionProfileDto>({
    queryKey: ['permissionProfiles', searchTerm, pagination.current, pagination.pageSize],
    
    fetchFn: () => permissionApi.getAll({ 
      name: searchTerm, 
      page_index: pagination.current,
      page_size: pagination.pageSize 
    }),

    createFn: (values: any) => {
      const payload = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        description_en: values.description_en,
        description_ar: values.description_ar,
        permissions: values.additional_names || [] 
      };
      return permissionApi.create(payload as CreatePermissionProfileDto);
    },

    updateFn: ({ id, data: values }: any) => {
      const payload = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        description_en: values.description_en,
        description_ar: values.description_ar,
        permissions: values.additional_names || [] 
      };
      return permissionApi.update(id, payload as UpdatePermissionProfileDto);
    },

    deleteFn: (id) => permissionApi.delete(id),
  });

  const columns = [
    { title: t("name_en"), dataIndex: "name_en", key: "name_en" },
    { title: t("name_ar"), dataIndex: "name_ar", key: "name_ar" },
    {
      title: t("description_en"),
      dataIndex: "description_en",
      key: "description_en",
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 1, overflow: "hidden" }}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: t("description_ar"),
      dataIndex: "description_ar",
      key: "description_ar",
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 1, overflow: "hidden", direction: "rtl" }}>
            {text}
          </div>
        </Tooltip>
      ),
    },
  ];

  const renderViewExtra = (record: PermissionProfile) => {
    if (!record || !record.permissions || record.permissions.length === 0) return null;

    const innerColumns = [
      { title: t("name_en"), dataIndex: 'name_en', key: 'name_en' },
      { title: t("name_ar"), dataIndex: 'name_ar', key: 'name_ar' },
    ];

    return (
      <Card bordered={false} className="admin-card">
        <Table 
          dataSource={record.permissions as any} 
          columns={innerColumns} 
          pagination={false} 
          size="middle" 
          rowKey={(r: any) => r.name_en || Math.random()} 
          bordered
        />
      </Card>
    );
  };

  const formItems = (
    <>
      <Form.Item 
        name="name_en" 
        label={t("name_en")} 
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

      <Card title={t("user_list.perm_title")} size="small" style={{ marginTop: 20 }}>
        <Form.List name="additional_names">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'name_en']}
                    rules={[{ required: true, message: t("required") }]}
                  >
                    <Input placeholder={t("name_en")} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'name_ar']}
                    rules={[{ required: true, message: t("required") }]}
                  >
                    <Input placeholder={t("name_ar")} style={{ direction: "rtl", textAlign: "right" }} />
                  </Form.Item>
                  <DeleteOutlined 
                    onClick={() => remove(name)} 
                    style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '16px', marginLeft: '8px' }} 
                    title={t("delete") || "Delete"} 
                  />
                </Space>
              ))}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t("permissionsPage.add_perm")}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>
    </>
  );

  const nestedFieldMappers = {
    additional_names: (record: PermissionProfile) => record.permissions || [],
  };

  return (
    <GenericCrudPage<PermissionProfile>
      title={t("user_list.perm_prof")}
      columns={columns}
      formItems={formItems}
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
      onSearch={(val) => {
        setSearchTerm(val);
        setPagination(prev => ({ ...prev, current: 1 })); 
      }}
      viewExtraNode={renderViewExtra}
      nestedFieldMappers={nestedFieldMappers}
    />
  );
};

export default PermissionsPage;