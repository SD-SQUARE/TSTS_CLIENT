// import { specializationApi, departmentApi } from '../services/api'; // commented for now 
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Tooltip } from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import type { Specialization,  } from "../types/types";
import type {Department} from "../../departments/types/types"
import { useTranslation } from "react-i18next";


// ----------- TEMP STATIC DATA -----------
const STATIC_DEPARTMENTS: Department[] = [
  { id: 1, name_en: "Computer Science", name_ar: "علوم الحاسوب", universityId: 1, domainId: 1 },
  { id: 2, name_en: "Civil Engineering", name_ar: "الهندسة المدنية", universityId: 1, domainId: 1 },
  { id: 3, name_en: "Business Administration", name_ar: "إدارة الأعمال", universityId: 2, domainId: 2 },
];

const STATIC_SPECIALIZATIONS: Specialization[] = [
  {
    id: 101,
    name_en: "Artificial Intelligence",
    name_ar: "الذكاء الاصطناعي",
    description_en: "Focus on ML and Neural Networks",
    description_ar: "التركيز على تعلم الآلة والشبكات العصبية",
    departmentId: 1,
  },
  {
    id: 102,
    name_en: "Cyber Security",
    name_ar: "أمن المعلومات",
    description_en: "Network security and cryptography",
    description_ar: "أمن الشبكات والتشفير",
    departmentId: 1,
  },
  {
    id: 201,
    name_en: "Structural Engineering",
    name_ar: "الهندسة الإنشائية",
    description_en: "Building stability analysis",
    description_ar: "تحليل استقرار المباني",
    departmentId: 2,
  },
];

// Mock service
const mockService = {
  getAll: async () => new Promise<Specialization[]>((resolve) => setTimeout(() => resolve(STATIC_SPECIALIZATIONS), 500)),
  create: async (data: any) => { console.log("Mock Create Spec:", data); return Promise.resolve(data); },
  update: async (id: string | number, data: any) => { console.log("Mock Update Spec:", id, data); return Promise.resolve(data); },
  delete: async (id: string | number) => { console.log("Mock Delete Spec:", id); return Promise.resolve(); },
} as any;

// -----------------------------------------

const SpecializationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    // Load departments
    setDepartments(STATIC_DEPARTMENTS);
  }, []);

  // ---------- TABLE COLUMNS ----------
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
      title: t("department"),
      dataIndex: "departmentId",
      key: "department",
      render: (id: number) => {
        const dept = departments.find((d) => d.id === id);
        return dept ? <span>{dept.name_en}</span> : id;
      },
    },
  ];

  // ---------- FORM ITEMS ----------
  const formItems = (
    <>
      {/* Name EN */}
      <Form.Item name="name_en" label={t("name_en")}  rules={[
    { required: true, message: t("required") },
    {
      pattern: /^[A-Za-z0-9\s.,-]*$/,
      message: t("english_only"),
    },
  ]}>
        <Input placeholder={t("name_en")} />
      </Form.Item>

      {/* Name AR */}
    <Form.Item name="name_ar" label={t("name_ar")} rules={[
    { required: true, message: t("required") },
    {
      pattern: /^[\u0600-\u06FF\s0-9.,-]*$/,
      message: t("arabic_only"),
    },
  ]}>
        <Input placeholder={t("name_ar")} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      {/* Description EN */}
      <Form.Item name="description_en" label={t("description_en")}
      rules={[
        {
          pattern: /^[A-Za-z0-9\s.,-]*$/,
          message: t("english_only"),
        },
      ]}>
        <Input.TextArea placeholder={t("description_en")} rows={4} />
      </Form.Item>

      {/* Description AR */}
      <Form.Item name="description_ar" label={t("description_ar")}
      rules={[
        {
          pattern: /^[\u0600-\u06FF\s0-9.,-]*$/,
          message: t("arabic_only"),
        },
      ]}>
        <Input.TextArea placeholder={t("description_ar")} rows={4} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      {/* Department */}
      <Form.Item name="departmentId" label={t("department")} rules={[{ required: true, message: t("required") }]}>
        <Select
          placeholder={t("select_department")}
          options={departments.map((d) => ({ label: d.name_en, value: d.id }))}
        />
      </Form.Item>
    </>
  );

  return <GenericCrudPage<Specialization> title={t("specializations")} columns={columns} formItems={formItems} service={mockService} />;
};

export default SpecializationsPage;
