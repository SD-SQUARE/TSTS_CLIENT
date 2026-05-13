import React, { useState } from "react";
import { Form, Input, Select, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { GenericCrudPage } from "../../../components/GenericCrudPage";
import { useGenericCrud } from "../../../api/common/hooks/common-hooks";
import type { Domain, CreateDomainDto, UpdateDomainDto } from "../types/types";
import { useTranslation } from "react-i18next";
import { domainApi } from "../services/domainsApi";
import type { CreateUniversityDto, University, UpdateUniversityDto } from "../../universities/types/types";
import { universityApi } from "../../universities/services/universityApi";
import {
  getServerTextFilterProps,
  getServerSelectFilterProps,
} from "../../../components/table/serverFilters";
import { ARABIC_TEXT_PATTERN, ENGLISH_TEXT_PATTERN } from "../../../utils/validationPatterns";



const DomainsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  const [filters, setFilters] = useState({
    name_en: undefined as string | undefined,
    name_ar: undefined as string | undefined,
    description_en: undefined as string | undefined,
    description_ar: undefined as string | undefined,
    university: undefined as string | undefined,
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
  } = useGenericCrud<Domain, CreateDomainDto, UpdateDomainDto>({
    queryKey: ['domains', filters, pagination.current, pagination.pageSize],
    fetchFn: () => domainApi.getAll({ 
      page: pagination.current,
      page_size: pagination.pageSize,
      ...filters,
    }),
    fetchOneFn: (id) => domainApi.getById(id),
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

  const getLocalizedLookupName = (item?: {
    name_en?: string;
    name_ar?: string;
    name?: { en?: string; ar?: string } | string;
  }) => {
    const localizedName = i18n.language === "ar"
      ? item?.name_ar ?? (typeof item?.name === "object" ? item.name?.ar : undefined)
      : item?.name_en ?? (typeof item?.name === "object" ? item.name?.en : undefined);

    if (localizedName) {
      return localizedName;
    }

    return typeof item?.name === "string" ? item.name : "-";
  };

  const uniOptions = universities?.map((u) => ({
    label: getLocalizedLookupName(u),
    value: u.id,
  })) ?? [];

    const columns: ColumnsType<Domain> = [
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
                                textOverflow: "ellipsis",
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
                                textOverflow: "ellipsis",
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

        {
            title: t("translation.universities"), 
            key: "university",
            render: (_: any, record: any) => {
                return getLocalizedLookupName(record.university);
            },
            ...getServerSelectFilterProps({
              filterKey: "university",
              filters,
              setFilters,
              placeholder: `${t("common.search")} ${t("university")}`,
              options: uniOptions,
              onChange: resetToFirstPage,
            }),
        },
    ];

  const formItems = (
    <>
      <Form.Item 
        name="name_en" 
        label={t("name_en")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: ENGLISH_TEXT_PATTERN, message: t("english_only") },
        ]}
      >
        <Input placeholder={t("name_en")} />
      </Form.Item>

      <Form.Item 
        name="name_ar" 
        label={t("name_ar")} 
        rules={[
          { required: true, message: t("required") },
          { pattern: ARABIC_TEXT_PATTERN, message: t("arabic_only") },
        ]}
      >
        <Input placeholder={t("name_ar")} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Form.Item 
        name="description_en" 
        label={t("description_en")}
        rules={[
          { pattern: ENGLISH_TEXT_PATTERN, message: t("english_only") },
        ]}
      >
        <Input.TextArea placeholder={t("description_en")} rows={4} />
      </Form.Item>

      <Form.Item 
        name="description_ar" 
        label={t("description_ar")}
        rules={[
          { pattern: ARABIC_TEXT_PATTERN, message: t("arabic_only") },
        ]}
      >
        <Input.TextArea placeholder={t("description_ar")} rows={4} style={{ direction: "rtl", textAlign: "right" }} />
      </Form.Item>

      <Form.Item
        name="university"
        label={t("translation.universities")}
        rules={[{ required: true, message: t("required") }]}
      >
        <Select
          placeholder={t("select_university")}
          options={uniOptions}
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
      title={t("translation.Domains")}
      columns={columns}
      formItems={formItems}
      data={data}total={total}
      pageIndex={pagination.current}
      pageSize={pagination.pageSize}
      onPageChange={(page, size) => setPagination({ current: page, pageSize: size })}
      isLoading={isLoading}
      useGetOne={useGetOne}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      nestedFieldMappers={nestedFieldMappers} 
      showToolbarSearch={false}
    />
  );
};

export default DomainsPage;
