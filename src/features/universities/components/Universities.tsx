import React, { useState } from 'react';
import { Form, Input, Tooltip } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { universityApi } from '../services/universityApi';
import type { University, CreateUniversityDto, UpdateUniversityDto } from '../types/types';
import { useTranslation } from "react-i18next";

const UniversitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  
  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<University, CreateUniversityDto, UpdateUniversityDto>({
    queryKey: ['universities', searchTerm, pagination.current, pagination.pageSize],
    fetchFn: () => universityApi.getAll({ 
      name: searchTerm, 
      page: pagination.current, 
      page_size: pagination.pageSize 
    }),
    createFn: (data) => universityApi.create(data),
    updateFn: ({ id, data }) => universityApi.update(id, data),
    deleteFn: (id) => universityApi.delete(id),
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

  const formItems = (
    <>
      <Form.Item name="name_en" label={t("name_en")} rules={[{ required: true },
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") }]}>
        <Input />
      </Form.Item>
      <Form.Item 
        name="name_ar" 
        label={t("name_ar")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
      >
        <Input style={{ direction: "rtl" }} />
      </Form.Item>
      <Form.Item 
        name="description_en" 
        label={t("description_en")}
        rules={[
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") },
        ]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item 
        name="description_ar" 
        label={t("description_ar")}
        rules={[
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
      >
        <Input.TextArea rows={4} style={{ direction: "rtl" }} />
      </Form.Item>
    </>
  );

  return (
    <GenericCrudPage<University>
      title={t("universities")}
      columns={columns}
      formItems={formItems}
      data={data ?? []}
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
    />
  );
};

export default UniversitiesPage;