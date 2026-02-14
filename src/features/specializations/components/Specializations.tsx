import React, { useEffect, useState } from "react";
import { Form, Input, Select, Tooltip , message, Switch} from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import { specializationApi } from '../services/specializationsApi';
import { departmentApi} from '../../departments/services/departmentApi'
import type { Specialization, CreateSpecializationDto, UpdateSpecializationDto } from "../types/types";
import type { Department } from "../../departments/types/types";
import { useTranslation } from "react-i18next";

const SpecializationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Specialization, CreateSpecializationDto, UpdateSpecializationDto>({
    queryKey: ['specializations', searchTerm],
      fetchFn: () => specializationApi.getAll({ name: searchTerm }),
    createFn: (data) => specializationApi.create(data),
    updateFn: ({ id, data }) => specializationApi.update(id, data),
    deleteFn: (id) => specializationApi.delete(id),
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
      title: t("review_required"), 
      dataIndex: "review_required",
      key: "review_required",
      render: (checked: boolean) => (
        <Switch checked={checked} disabled />
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
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      searchText={searchTerm}
      onSearch={(val) => setSearchTerm(val)}
    />
  );
};

export default SpecializationsPage;