import React from 'react';
import { Form, Input, Tooltip } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import type { University } from '../types/types';
// import { universityApi } from '../services/api'; // commented for now
import { useTranslation } from "react-i18next";



const STATIC_UNIVERSITIES: University[] = [
  {
    id: 1,
    name_en: "Cairo University",
    name_ar: "جامعة القاهرة",
    description_en: "Premier public university in Giza mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm.",
    description_ar: "جامعة حكومية رائدة في الجيزة.",
  },
  {
    id: 2,
    name_en: "Ain Shams University",
    name_ar: "جامعة عين شمس",
    description_en: "Major public university in Cairo.",
    description_ar: "جامعة حكومية كبرى في القاهرة.",
  },
];


const mockService = {
  getAll: async () => {
    return new Promise<University[]>((resolve) => {
      setTimeout(() => resolve(STATIC_UNIVERSITIES), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create Uni:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update Uni:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete Uni:', id);
    return Promise.resolve();
  }
} as any;

const UniversitiesPage: React.FC = () => {

const { t } = useTranslation();

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
];
  const formItems = (
    <>
      <Form.Item 
        name="name_en" 
        label={t("name_en")}
        rules={[
          { required: true, message: t("required") },
          {
            pattern: /^[A-Za-z0-9\s.,-]*$/,
            message: t("english_only"),
          },
        ]}>
        <Input placeholder="Helwan University" />
      </Form.Item>
  
      <Form.Item name="name_ar" label={t("name_ar")} rules={[
    { required: true, message: t("required") },
    {
      pattern: /^[\u0600-\u06FF\s0-9.,-]*$/,
      message: t("arabic_only"),
    },
  ]}>
        <Input placeholder="جامعة حلوان" style={{ direction: "rtl" }} />
      </Form.Item>
  
      <Form.Item name="description_en" label={t("description_en")}
      rules={[
        {
          pattern: /^[A-Za-z0-9\s.,-]*$/,
          message: t("english_only"),
        },
      ]}>
        <Input.TextArea rows={4} />
      </Form.Item>
  
      <Form.Item name="description_ar" label={t("description_ar")}
      rules={[
        {
          pattern: /^[\u0600-\u06FF\s0-9.,-]*$/,
          message: t("arabic_only"),
        },
      ]}>
        <Input.TextArea rows={4} style={{ direction: "rtl" }} />
      </Form.Item>
    </>
  );
  
  return (
    <GenericCrudPage<University>
      title="Universities (Test Mode)"
      service={mockService} 
      columns={columns}
      formItems={formItems}
    />
  );
};

export default UniversitiesPage;