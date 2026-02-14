import React, { useState } from "react";
import { Form, Input, Select, Tooltip } from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from "../types/types";
import { useTranslation } from "react-i18next";
import type { CreateDomainDto, Domain, UpdateDomainDto } from "../../domains/types/types";
import { domainApi } from "../../domains/services/domainsApi";
import { departmentApi } from "../services/departmentApi";

const DepartmentsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedUni, setSelectedUni] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); 

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Department, CreateDepartmentDto, UpdateDepartmentDto>({
    queryKey: ['departments', searchTerm],
      fetchFn: () => departmentApi.getAll({ name: searchTerm }),
    createFn: (data) => departmentApi.create(data),
    updateFn: ({ id, data }) => departmentApi.update(id, data),
    deleteFn: (id) => departmentApi.delete(id),
  });

const {
    data: domains,
    isLoading: _isLoading,
    createMutation: _cd,
    updateMutation: _ud,
    deleteMutation: _deld,
  } = useGenericCrud<Domain, CreateDomainDto, UpdateDomainDto>({
    queryKey: ['domains'],
    fetchFn: () => domainApi.getAll(),
    createFn: (data) => domainApi.create(data),
    updateFn: ({ id, data }) => domainApi.update(id, data),
    deleteFn: (id) => domainApi.delete(id),
  });
    const uniOptions = domains?.map((u) => ({
        label: i18n.language === "ar" ? u.name_ar : u.name_en,
        value: u.id,
})) ?? [];

  const columns = [
    { title: t("name_en"), dataIndex: "name_en", key: "name_en" },
    { title: t("name_ar"), dataIndex: "name_ar", key: "name_ar" },

    {
      title: t("description_en"),
      dataIndex: "description_en",
      key: "description_en",
      render: (text: string) => (
        <Tooltip title={text}>
          <div
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
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
          <div
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              direction: "rtl",
              textAlign: "right",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },

    {
      title: t("domain"),
      dataIndex: "domain",
      key: "domain",
      render: (_: number, record) => {
          const domain = record.domain;
          const domainName = i18n.language === "ar" ? domain.name.ar : domain.name.en;
          return domainName;
      },
    },
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name_en" 
        label={t("name_en")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") },
        ]}
      >
        <Input placeholder={t("name_en")} />
      </Form.Item>

      <Form.Item 
        name="name_ar" 
        label={t("name_ar")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
      >
        <Input placeholder={t("name_ar")} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Form.Item 
        name="description_en" 
        label={t("description_en")}
        rules={[
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") },
        ]}
      >
        <Input.TextArea placeholder={t("description_en")} rows={4} />
      </Form.Item>

      <Form.Item 
        name="description_ar" 
        label={t("description_ar")}
        rules={[
          { pattern: /^[\u0600-\u06FF\s0-9.,-]*$/, message: t("arabic_only") },
        ]}
      >
        <Input.TextArea placeholder={t("description_ar")} rows={4} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Form.Item
        name="domain"
        label={t("domain")}
        rules={[{ required: true, message: t("required") }]}
      >
        <Select
          placeholder={t("select_domain")}
          options={uniOptions}
          onChange={(val) => setSelectedUni(val)}
        />
      </Form.Item>
    </>
  );

const nestedFieldMappers = {
    university: (record: Department) => record.university?.id ?? null,
    domain: (record: Department) => record.domain?.id ?? null
};
  return (
    <GenericCrudPage<Department>
      title={t("departments")}
      columns={columns}
      formItems={formItems}
      data={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      nestedFieldMappers={nestedFieldMappers}   
      searchText={searchTerm}
      onSearch={(val) => setSearchTerm(val)} 
    />
  );
};

export default DepartmentsPage;