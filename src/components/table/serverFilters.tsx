import React from "react";
import { Button, Flex, Input, Select, Space } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableColumnType } from "antd";
import i18next from "i18next";

interface ServerFilterBase<
  T extends object,
  TFilters extends Record<string, any>,
> {
  filterKey: keyof TFilters & string;
  filters: TFilters;
  setFilters: React.Dispatch<React.SetStateAction<TFilters>>;
  onChange?: () => void;
}

interface ServerTextFilterOptions<
  T extends object,
  TFilters extends Record<string, any>,
> extends ServerFilterBase<T, TFilters> {
  placeholder: string;
}

interface ServerSelectFilterOptions<
  T extends object,
  TFilters extends Record<string, any>,
> extends ServerFilterBase<T, TFilters> {
  placeholder: string;
  options: Array<{ label: React.ReactNode; value: string | number }>;
}

export const getServerTextFilterProps = <
  T extends object,
  TFilters extends Record<string, any>,
>({
  filterKey,
  filters,
  setFilters,
  placeholder,
  onChange,
}: ServerTextFilterOptions<T, TFilters>): TableColumnType<T> => ({
  filteredValue: filters[filterKey] ? [filters[filterKey]] : null,
  filterDropdown: ({ setSelectedKeys, selectedKeys, clearFilters, confirm, close }) => (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Input
        autoFocus
        placeholder={placeholder}
        value={(selectedKeys[0] as string | undefined) ?? ""}
        onChange={(event) =>
          setSelectedKeys(event.target.value ? [event.target.value] : [])
        }
        onPressEnter={() => {
          const nextValue = (selectedKeys[0] as string | undefined)?.trim();
          confirm();
          setFilters((prev) => ({
            ...prev,
            [filterKey]: nextValue || undefined,
          }));
          onChange?.();
        }}
        style={{ marginBottom: 8, display: "block", minWidth: 220 }}
      />
      <Space>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          size="small"
          onClick={() => {
            const nextValue = (selectedKeys[0] as string | undefined)?.trim();
            confirm();
            setFilters((prev) => ({
              ...prev,
              [filterKey]: nextValue || undefined,
            }));
            onChange?.();
          }}
        >
          {i18next.t("common.search")}
        </Button>
        <Button
          size="small"
          onClick={() => {
            clearFilters?.();
            confirm();
            setFilters((prev) => ({
              ...prev,
              [filterKey]: undefined,
            }));
            onChange?.();
          }}
        >
          {i18next.t("common.reset")}
        </Button>
        <Button type="link" size="small" onClick={() => close()}>
          {i18next.t("common.close")}
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
  ),
});

export const getServerSelectFilterProps = <
  T extends object,
  TFilters extends Record<string, any>,
>({
  filterKey,
  filters,
  setFilters,
  placeholder,
  options,
  onChange,
}: ServerSelectFilterOptions<T, TFilters>): TableColumnType<T> => ({
  filteredValue:
    filters[filterKey] !== undefined && filters[filterKey] !== null
      ? [filters[filterKey]]
      : null,
  filterDropdown: ({ selectedKeys, setSelectedKeys, clearFilters, confirm }) => (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Select
        showSearch
        allowClear
        placeholder={placeholder}
        style={{ width: 220, marginBottom: 8 }}
        optionFilterProp="label"
        value={
          (selectedKeys[0] as string | number | undefined) ??
          ((filters[filterKey] as string | number | undefined) ?? undefined)
        }
        onChange={(value) => setSelectedKeys(value !== undefined ? [value] : [])}
        options={options}
      />
      <Flex gap="small">
        <Button
          type="primary"
          size="small"
          style={{ flex: 1 }}
          onClick={() => {
            const selectedValue = selectedKeys[0] as
              | string
              | number
              | undefined;
            confirm();
            setFilters((prev) => ({
              ...prev,
              [filterKey]: selectedValue ?? undefined,
            }));
            onChange?.();
          }}
        >
          {i18next.t("common.filter")}
        </Button>
        <Button
          size="small"
          style={{ flex: 1 }}
          onClick={() => {
            clearFilters?.();
            confirm();
            setFilters((prev) => ({
              ...prev,
              [filterKey]: undefined,
            }));
            onChange?.();
          }}
        >
          {i18next.t("common.reset")}
        </Button>
      </Flex>
    </div>
  ),
  filterIcon: (filtered) => (
    <FilterOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
  ),
});
