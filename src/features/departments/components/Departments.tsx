import React, { useState } from "react";
import { Form, Input, Select, Tooltip } from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from "../types/types";
import { useTranslation } from "react-i18next";

const MOCK_UNIVERSITIES = [
  { label_en: "Cairo University", label_ar: "جامعة القاهرة", value: 1 },
  { label_en: "Ain Shams University", label_ar: "جامعة عين شمس", value: 2 },
];

const STATIC_DEPARTMENTS: Department[] = [
  {
    id: 101,
    name_en: "Computer Engineering",
    name_ar: "هندسة الحاسوب",
    description_en: "Hardware and Software integration",
    description_ar: "تكامل الأجهزة والبرامج",
    universityId: 1,
    domainId: 10,
  },
  {
    id: 102,
    name_en: "General Surgery",
    name_ar: "الجراحة العامة",
    description_en: "Surgical procedures department",
    description_ar: "قسم الإجراءات الجراحية",
    universityId: 1,
    domainId: 11,
  },
  {
    id: 201,
    name_en: "Accounting",
    name_ar: "المحاسبة",
    description_en: "Financial records",
    description_ar: "السجلات المالية",
    universityId: 2,
    domainId: 20,
  },
];

const mockDepartmentService = {
  getAll: async (): Promise<Department[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(STATIC_DEPARTMENTS), 500));
  },
  create: async (data: CreateDepartmentDto): Promise<Department> => {
    console.log("Mock Create Department:", data);
    const newDept = { ...data, id: Date.now() } as Department;
    return Promise.resolve(newDept);
  },
  update: async (id: string | number, data: UpdateDepartmentDto): Promise<Department> => {
    console.log("Mock Update Department:", id, data);
    const updated = { ...data, id } as Department;
    return Promise.resolve(updated);
  },
  delete: async (id: string | number): Promise<void> => {
    console.log("Mock Delete Department:", id);
    return Promise.resolve();
  },
};

const DepartmentsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedUni, setSelectedUni] = useState<number | null>(null);

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<Department, CreateDepartmentDto, UpdateDepartmentDto>({
    queryKey: ['departments'],
    fetchFn: mockDepartmentService.getAll,
    createFn: mockDepartmentService.create,
    updateFn: ({ id, data }) => mockDepartmentService.update(id, data),
    deleteFn: mockDepartmentService.delete,
  });

  const uniOptions = MOCK_UNIVERSITIES.map((u) => ({
    label: i18n.language === "ar" ? u.label_ar : u.label_en,
    value: u.value,
  }));

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
      dataIndex: "universityId",
      key: "university",
      render: (id: number) => {
        const uni = MOCK_UNIVERSITIES.find((u) => u.value === id);
        return uni ? (i18n.language === "ar" ? uni.label_ar : uni.label_en) : id;
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
        name="universityId"
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
    />
  );
};

export default DepartmentsPage;