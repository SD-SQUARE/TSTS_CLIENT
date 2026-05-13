import React, { useState } from 'react';
import { Form, Input, Tooltip } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { universityApi } from '../services/universityApi';
import type { University, CreateUniversityDto, UpdateUniversityDto } from '../types/types';
import { useTranslation } from "react-i18next";
import { getServerTextFilterProps } from "../../../components/table/serverFilters";
import { ARABIC_TEXT_PATTERN, ENGLISH_TEXT_PATTERN } from "../../../utils/validationPatterns";

const UniversitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  const [filters, setFilters] = useState({
    name_en: undefined as string | undefined,
    name_ar: undefined as string | undefined,
    description_en: undefined as string | undefined,
    description_ar: undefined as string | undefined,
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
  } = useGenericCrud<University, CreateUniversityDto, UpdateUniversityDto>({
    queryKey: ['universities', filters, pagination.current, pagination.pageSize],
    fetchFn: () => universityApi.getAll({ 
      page: pagination.current, 
      page_size: pagination.pageSize,
      ...filters,
    }),
    fetchOneFn: (id) => universityApi.getById(id),
    createFn: (data) => universityApi.create(data),
    updateFn: ({ id, data }) => universityApi.update(id, data),
    deleteFn: (id) => universityApi.delete(id),
  });

    const columns = [
        {
            title: t("name_en"),
            key: "name_en",
            render: (_: any, record: any) => record.name?.en || "-",
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
            key: "name_ar",
            render: (_: any, record: any) => record.name?.ar || "-",
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
            key: "description_en",
            render: (_: any, record: any) => {
                const text = record.description?.en || "";
                return (
                    <Tooltip title={text}>
                        <div
                            style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 1,
                                overflow: "hidden",
                            }}
                        >
                            {text || "-"}
                        </div>
                    </Tooltip>
                );
            },
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
            key: "description_ar",
            render: (_: any, record: any) => {
                const text = record.description?.ar || "";
                return (
                    <Tooltip title={text}>
                        <div
                            style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 1,
                                overflow: "hidden",
                                direction: "rtl",
                                textAlign: "right",
                            }}
                        >
                            {text || "-"}
                        </div>
                    </Tooltip>
                );
            },
            ...getServerTextFilterProps({
              filterKey: "description_ar",
              filters,
              setFilters,
              placeholder: `${t("common.search")} ${t("description_ar")}`,
              onChange: resetToFirstPage,
            }),
        },
    ];

  const formItems = (
    <>
      <Form.Item name="name_en" label={t("name_en")} rules={[{ required: true },
          { pattern: ENGLISH_TEXT_PATTERN, message: t("english_only") }]}>
        <Input />
      </Form.Item>
      <Form.Item 
        name="name_ar" 
        label={t("name_ar")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: ARABIC_TEXT_PATTERN, message: t("arabic_only") },
        ]}
      >
        <Input style={{ direction: "rtl" }} />
      </Form.Item>
      <Form.Item 
        name="description_en" 
        label={t("description_en")}
        rules={[
          { pattern: ENGLISH_TEXT_PATTERN, message: t("english_only") },
        ]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item 
        name="description_ar" 
        label={t("description_ar")}
        rules={[
          { pattern: ARABIC_TEXT_PATTERN, message: t("arabic_only") },
        ]}
      >
        <Input.TextArea rows={4} style={{ direction: "rtl" }} />
      </Form.Item>
    </>
  );

  return (
    <GenericCrudPage<University>
      title={t("universities")}
      columns={columns}
      formItems={formItems}
      data={data ?? []}
      total={total}
      useGetOne={useGetOne}
      isLoading={isLoading}
      pageIndex={pagination.current}
      pageSize={pagination.pageSize}
      onPageChange={(page, size) => setPagination({ current: page, pageSize: size })}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      showToolbarSearch={false}
    />
  );
};

export default UniversitiesPage;
