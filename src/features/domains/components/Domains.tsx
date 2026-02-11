import React, { useState } from "react";
import { Form, Input, Select, Tooltip } from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import type { Domain, CreateDomainDto, UpdateDomainDto } from "../types/types";
import { useTranslation } from "react-i18next";
import { domainApi } from "../services/domainsApi";
import type { CreateUniversityDto, University, UpdateUniversityDto } from "../../universities/types/types";
import { universityApi } from "../../universities/services/universityApi";



const DomainsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedUni, setSelectedUni] = useState<number | null>(null);

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Domain, CreateDomainDto, UpdateDomainDto>({
    queryKey: ['domains'],
    fetchFn: () => domainApi.getAll(),
    createFn: (data) => domainApi.create(data),
    updateFn: ({ id, data }) => domainApi.update(id, data),
    deleteFn: (id) => domainApi.delete(id),
  });

  const {
      data: universities,
      isLoading: _uniLoading,
      createMutation: _createUni,
      updateMutation: _updateUni,
      deleteMutation : _deleteUni,
    } = useGenericCrud<University, CreateUniversityDto, UpdateUniversityDto>({
      queryKey: ['universities'],
      fetchFn: () => universityApi.getAll(),
      createFn: (data) => universityApi.create(data),
      updateFn: ({ id, data }) => universityApi.update(id, data),
      deleteFn:  (id) => universityApi.delete(id),
    });

  const uniOptions = universities?.map((u) => ({
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
      title: t("university"),
    dataIndex: "university",
      key: "university",
        render: (_: number, record) => {
            const university = record.university;
            const universityName = i18n.language === "ar" ? university.name.ar : university.name.en;
            return universityName;
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
        name="university"
        label={t("university")}
        rules={[{ required: true, message: t("required") }]}
      >
        <Select
          placeholder={t("select_university")}
          options={uniOptions}
          onChange={(val) => setSelectedUni(val)}
        />
      </Form.Item>
    </>
  );

    const nestedFieldMappers = {
        university: (record: Domain) => record.university?.id ?? null,
        // if you have more nested fields:
        // category: (record: Product) => record.category?.id ?? null,
        // author: (record: Book) => record.author?.id ?? null,
    };
  return (
    <GenericCrudPage<Domain>
      title={t("Domains")}
      columns={columns}
      formItems={formItems}
      data={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      nestedFieldMappers={nestedFieldMappers}    
    />
  );
};

export default DomainsPage;