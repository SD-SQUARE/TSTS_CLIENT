import React, { useState } from "react";
import { Form, Input, Select, Tooltip, Switch, Button, Space, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons"; 
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

  const { data: specResponse, isLoading: isLookupsLoading } = useQuery({
    queryKey: ['specializations-lookup'],
    queryFn: () => specializationApi.getAll(), 
  });

    const specializationsArray = (specResponse as any)?.specializations ?? [];

    console.log("specResponse", specResponse);

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Problem, CreateProblemDto, UpdateProblemDto>({
    queryKey: ['problems', searchTerm, selectedSpecId],
    fetchFn: () => problemsApi.getAll({ 
        name: searchTerm, 
      specialization_id: selectedSpecId
    }),
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
          <div style={{ padding: 8 }}>
            <Select
                key={specializationsArray.length} 
              showSearch
              placeholder={t("filter_by_spec")}
              value={selectedSpecId}
              onChange={(val) => {
                setSelectedSpecId(val);
                confirm(); 
              }}
            //   style={{ width: "fit-content", marginBottom: 8, display: 'block' }}
              allowClear
              onClear={() => {
                setSelectedSpecId(undefined);
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
      },{
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
      <Form.Item name="name_en" label={t("name_en")} rules={[{ required: true },
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") }]}>
        <Input />
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
        rules={[
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
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

  return (
    <GenericCrudPage<Problem>
      title={t("problems")}
      columns={columns}
      formItems={formItems}
      data={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      searchText={searchTerm}
      onSearch={(val) => setSearchTerm(val)}
    />
  );
};

export default ProblemsPage;