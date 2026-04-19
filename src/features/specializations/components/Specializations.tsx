import React, {  useState } from "react";
import { Form, Input, Tooltip ,  Switch, Tag} from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import { specializationApi } from '../services/specializationsApi';
// import { departmentApi} from '../../departments/services/departmentApi'
import type { Specialization, CreateSpecializationDto, UpdateSpecializationDto } from "../types/types";
// import type { Department } from "../../departments/types/types";
import { useTranslation } from "react-i18next";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  getServerSelectFilterProps,
  getServerTextFilterProps,
} from "../../../components/table/serverFilters";

const SpecializationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  const [filters, setFilters] = useState({
    name_en: undefined as string | undefined,
    name_ar: undefined as string | undefined,
    description_en: undefined as string | undefined,
    description_ar: undefined as string | undefined,
    review_required: undefined as string | undefined,
  });

  const resetToFirstPage = () =>
    setPagination((prev) => ({ ...prev, current: 1 }));

  const {
    data,
    total,
    useGetOne,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Specialization, CreateSpecializationDto, UpdateSpecializationDto>({
    queryKey: ['specializations', filters, pagination.current, pagination.pageSize],
    fetchFn: () => specializationApi.getAll({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
      }),
    fetchOneFn: (id) => specializationApi.getById(id),
    createFn: (data) => specializationApi.create(data),
    updateFn: ({ id, data }) => specializationApi.update(id, data),
    deleteFn: (id) => specializationApi.delete(id),
  });

  const columns = [
    {
      title: t("name_en"),
      dataIndex: "name_en",
      key: "name_en",
      ...getServerTextFilterProps({
        filterKey: "name_en",
        filters,
        setFilters,
        placeholder: `${t("common.search")} ${t("name_en")}`,
        onChange: resetToFirstPage,
      }),
    },
    {
      title: t("name_ar"),
      dataIndex: "name_ar",
      key: "name_ar",
      ...getServerTextFilterProps({
        filterKey: "name_ar",
        filters,
        setFilters,
        placeholder: `${t("common.search")} ${t("name_ar")}`,
        onChange: resetToFirstPage,
      }),
    },
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
      ...getServerTextFilterProps({
        filterKey: "description_en",
        filters,
        setFilters,
        placeholder: `${t("common.search")} ${t("description_en")}`,
        onChange: resetToFirstPage,
      }),
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
      ...getServerTextFilterProps({
        filterKey: "description_ar",
        filters,
        setFilters,
        placeholder: `${t("common.search")} ${t("description_ar")}`,
        onChange: resetToFirstPage,
      }),
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
      ...getServerSelectFilterProps({
        filterKey: "review_required",
        filters,
        setFilters,
        placeholder: `${t("common.select")} ${t("review_required")}`,
        options: [
          { label: t("yes"), value: "true" },
          { label: t("no"), value: "false" },
        ],
        onChange: resetToFirstPage,
      }),
    },
  ];

  const formItems = (
    <>
      <Form.Item name="name_en" label={t("name_en")} rules={[{ required: true, message: t("required") },
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
    <GenericCrudPage<Specialization>
      title={t("specializations")}
      columns={columns}
      formItems={formItems}
      data={data}
      total={total}
      useGetOne={useGetOne}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      showToolbarSearch={false}
      pageIndex={pagination.current}
      pageSize={pagination.pageSize}
      onPageChange={(page, size) => setPagination({ current: page, pageSize: size })}
    />
  );
};

export default SpecializationsPage;
