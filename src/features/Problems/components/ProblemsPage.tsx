import React, { useState } from "react";
import { Form, Input, Select, Tooltip, Switch, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, FilterOutlined } from "@ant-design/icons"; 
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import { problemsApi } from '../services/problemsApi';
import { specializationApi } from '../../specializations/services/specializationsApi';
import type { Problem, CreateProblemDto, UpdateProblemDto } from "../types/types";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

const ProblemsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecId, setSelectedSpecId] = useState<string | number | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  const { data: specResponse, isLoading: isLookupsLoading } = useQuery({
    queryKey: ['specializations-lookup'],
    queryFn: () => specializationApi.getAll(), 
  });

  const specializationsArray = (specResponse as any)?.specializations ?? [];

  const {
    data,
    total,
    useGetOne,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Problem, CreateProblemDto, UpdateProblemDto>({
    queryKey: ['problems', searchTerm, selectedSpecId, pagination.current, pagination.pageSize],
    fetchFn: () => problemsApi.getAll({ 
      name: searchTerm, 
      specialization_id: selectedSpecId,
      page: pagination.current,
      page_size: pagination.pageSize
    }),
    fetchOneFn: (id) => problemsApi.getById(id),
    createFn: (data) => problemsApi.create(data),
    updateFn: ({ id, data }) => problemsApi.update(id, data),
    deleteFn: (id) => problemsApi.delete(id),
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
    {
      title: t("specialization_type"),
  dataIndex: "specialization",
  key: "specialization",
  filterIcon: (filtered: boolean) => (
    <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
  filterDropdown: ({ confirm, clearFilters }: any) => (
    <div style={{ padding: 8 }} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <Select
        key={specializationsArray.length} 
        showSearch
        placement={i18n.language === 'ar' ? "bottomRight" : "bottomLeft"}
        placeholder={t("filter_by_spec")}
        value={selectedSpecId}
        style={{ width: 180, direction: i18n.language === 'ar' ? 'rtl' : 'ltr' }}
        onChange={(val) => {
          setSelectedSpecId(val);
          setPagination(prev => ({ ...prev, current: 1 })); 
          confirm(); 
        }}
        allowClear
        onClear={() => {
          setSelectedSpecId(undefined);
          setPagination(prev => ({ ...prev, current: 1 }));
          clearFilters();
          confirm();
        }}
      >
        {specializationsArray.map((spec: any) => (
          <Select.Option key={spec.id} value={spec.id}>
            {i18n.language === 'ar' ? spec.name_ar : spec.name_en}
          </Select.Option>
        ))}
      </Select>
    </div>
  ),
  render: (spec: any) => (i18n.language === 'ar' ? spec?.name_ar : spec?.name_en) || "-",
},
    {
      title: t("review_required"), 
      dataIndex: "review_required",
      key: "review_required",
      render: (checked: boolean) => (
          <Tag key={checked ? "true" : "false"} color={checked ? "green" : "red"} variant="outlined" icon={checked ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
              {checked ? t("yes") : t("no")}
          </Tag>
      ),
    },
  ];

  const formItems = (
    <>
      <Form.Item name="name_en" label={t("name_en")} rules={[{ required: true, message: t("required") },
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") }]}>
        <Input />
      </Form.Item>
      
      <Form.Item 
        name="description_en" 
        label={t("description_en")}
        rules={[{ pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") }]}
      >
        <Input.TextArea rows={4} />
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
        name="description_ar" 
        label={t("description_ar")}
        rules={[{ pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") }]}
      >
        <Input.TextArea rows={4} style={{ direction: "rtl" }} />
      </Form.Item>

      <Form.Item 
        name="specialization" 
        label={t("specialization_type")} 
        rules={[{ required: true, message: t("required") }]}
      >
        <Select
          placeholder={t("select_specialization")}
          loading={isLookupsLoading}
          showSearch
          optionFilterProp="children"
        >
          {Array.isArray(specializationsArray) && specializationsArray.map((spec) => (
            <Select.Option key={spec.id} value={spec.id}>
              {i18n.language === 'ar' ? spec.name_ar : spec.name_en}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item 
        name="review_required" 
        label={t("review_required")} 
        valuePropName="checked" 
      >
        <Switch 
          checkedChildren={t("required")} 
          unCheckedChildren={t("not_required")} 
        />
      </Form.Item>
    </>
  );
  const nestedFieldMappers = {
    specialization: (record: Problem) => record.specialization?.id ?? null,
  };

  return (
    <GenericCrudPage<Problem>
      title={t("problems")}
      columns={columns}
      formItems={formItems}
      data={data ?? []}
      total={total}
      useGetOne={useGetOne} 
      nestedFieldMappers={nestedFieldMappers}
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

export default ProblemsPage;