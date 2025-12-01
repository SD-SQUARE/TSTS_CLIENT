
// import { domainApi } from '../services/api'; // commented for now

import React, { useState } from "react";
import { Form, Input, Select, Tag, Tooltip } from "antd";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import type { Domain } from "../types";
import { useTranslation } from "react-i18next";

const MOCK_UNIVERSITIES = [
  { label_en: "Cairo University", label_ar: "جامعة القاهرة", value: 1 },
  { label_en: "Ain Shams University", label_ar: "جامعة عين شمس", value: 2 },
  { label_en: "Helwan University", label_ar: "جامعة حلوان", value: 3 },
];

const STATIC_DOMAINS: Domain[] = [
  {
    id: 10,
    name_en: "Engineering",
    name_ar: "الهندسة",
    description_en: "Faculty of Engineering",
    description_ar: "كلية الهندسة",
    universityId: 1,
  },
  {
    id: 11,
    name_en: "Medicine",
    name_ar: "الطب",
    description_en: "Faculty of Medicine",
    description_ar: "كلية الطب",
    universityId: 1,
  },
  {
    id: 20,
    name_en: "Business & Commerce",
    name_ar: "الأعمال والتجارة",
    description_en: "Faculty of Commerce",
    description_ar: "كلية التجارة",
    universityId: 2,
  },
  {
    id: 30,
    name_en: "Fine Arts",
    name_ar: "الفنون الجميلة",
    description_en: "Faculty of Fine Arts",
    description_ar: "كلية الفنون الجميلة",
    universityId: 3,
  },
];

const mockService = {
  getAll: async () => new Promise<Domain[]>((resolve) => setTimeout(() => resolve(STATIC_DOMAINS), 500)),
  create: async (data: any) => { console.log("Mock Create Domain:", data); return Promise.resolve(data); },
  update: async (id: string | number, data: any) => { console.log("Mock Update Domain:", id, data); return Promise.resolve(data); },
  delete: async (id: string | number) => { console.log("Mock Delete Domain:", id); return Promise.resolve(); },
} as any;

// -----------------------------------------

const DomainsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedUni, setSelectedUni] = useState<number | null>(null);

  // Filter universities for dropdown labels based on language
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
      <Form.Item name="name_en" label={t("name_en")} rules={[{ required: true, message: t("required") }]}>
        <Input placeholder={t("name_en")} />
      </Form.Item>

      <Form.Item name="name_ar" label={t("name_ar")} rules={[{ required: true, message: t("required") }]}>
        <Input placeholder={t("name_ar")} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Form.Item name="description_en" label={t("description_en")}>
        <Input.TextArea placeholder={t("description_en")} rows={4} />
      </Form.Item>

      <Form.Item name="description_ar" label={t("description_ar")}>
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
    <GenericCrudPage<Domain>
      title={t("domains")}
      columns={columns}
      formItems={formItems}
      service={mockService}
    />
  );
};

export default DomainsPage;
