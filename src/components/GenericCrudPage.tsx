import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Space,
  message,
  Input,
  Descriptions,
  Card,
  Typography,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import AppTable from "./AppTable";
import { mapRecordToFormValues, type FieldMapper } from "../utils/mapper";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface GenericCrudProps<T> {
  title: string;
  columns: ColumnsType<T>;
  formItems: React.ReactNode;
  renderFormItems?: (context: {
    mode: "create" | "edit";
    record: T | null;
  }) => React.ReactNode;
  data: T[];
  isLoading: boolean;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  disableAdd?: boolean;
  nestedFieldMappers?: FieldMapper<T>;
  tableSize?: "small" | "middle" | "large";
  searchText?: string;
  onSearch?: (value: string) => void;
  viewExtraNode?: (record: T) => React.ReactNode;
  // ADDED: Prop for the hook so we can fetch details
  useGetOne?: (id?: string | number) => { data: any; isLoading: boolean };
}

export const GenericCrudPage = <T extends { id: string | number }>({
  title,
  columns,
  formItems,
  renderFormItems,
  data = [],
  isLoading,
  total = 0,
  pageIndex = 1,
  pageSize = 50,
  onPageChange,
  createMutation,
  updateMutation,
  deleteMutation,
  disableAdd = false,
  nestedFieldMappers = {},
  tableSize = "middle",
  searchText = "",
  onSearch,
  viewExtraNode,
  useGetOne,
}: GenericCrudProps<T>) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  // 1. Declare state first
  const [viewingItem, setViewingItem] = useState<T | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [form] = Form.useForm();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // 2. Safely call the hook (Provide dummy fallback to avoid React Hook errors if omitted)
  const defaultUseGetOne = () => ({ data: undefined, isLoading: false });
  const activeUseGetOne = useGetOne || defaultUseGetOne;
  const { data: freshItem, isLoading: isFetchingDetail } = activeUseGetOne(viewingItem?.id);

  const formStyle: React.CSSProperties = {
    marginTop: 20,
    direction: isRtl ? "rtl" : "ltr",
    textAlign: isRtl ? "right" : "left",
  };

  // 3. Sync fetched data with local viewing item
  useEffect(() => {
    if (freshItem) {
      setViewingItem(freshItem);
    }
  }, [freshItem]);

  const handleApiErrors = (error: any) => {
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err: any) => {
        form.setFields([{ name: err.key, errors: [err.message] }]);
      });
    } else {
      message.error(error.message || t("SERVER_ERROR"));
    }
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: values });
        message.success(t("crud.update_success", { title }));
      } else {
        await createMutation.mutateAsync(values);
        message.success(t("crud.create_success", { title }));
      }

      setIsEditModalOpen(false);
      form.resetFields();
      setEditingItem(null);
    } catch (err: any) {
      handleApiErrors(err);
    }
  };

  const executeDelete = (id: string | number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        message.success(t("crud.delete_success", { title }));
        setViewingItem(null);
      },
      onError: () => message.error(t("crud.delete_failed")),
    });
  };

  const openDeletePrompt = () => {
    setDeleteInput("");
    setIsDeleteModalOpen(true);
  };

  const verifyDeleteInput = () => {
    if (deleteInput !== "delete") {
      message.error(t("crud.delete_verify_error"));
      return;
    }

    setIsDeleteModalOpen(false);

    Modal.confirm({
      title: t("crud.delete_confirm_title"),
      icon: <ExclamationCircleOutlined />,
      content: t("crud.delete_confirm_content"),
      okText: t("translation.yes"),
      okType: "danger",
      cancelText: t("translation.no"),
      onOk() {
        if (viewingItem) {
          executeDelete(viewingItem.id);
        }
      },
    });
  };

  const handleRowClick = (record: T) => {
    setViewingItem(record); // Sets initial basic data from row
    window.scrollTo(0, 0);
  };

  const handleBackToTable = () => {
    setViewingItem(null);
  };

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsEditModalOpen(true);
  };

  const openEditModal = (record: T) => {
    setEditingItem(record);
    form.setFieldsValue(mapRecordToFormValues(record, nestedFieldMappers));
    setIsEditModalOpen(true);
  };

  // ==============================
  // DETAIL VIEW
  // ==============================
  if (viewingItem) {
    return (
      <div className="fade-in-animation" dir={isRtl ? "rtl" : "ltr"}>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <h2 style={{ margin: 0 }}>{t("crud.details")}</h2>
          </Space>

          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openEditModal(viewingItem)}
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor: "var(--color-secondary)",
                color: "var(--color-black)",
              }}
            >
              {t("translation.edit")}
            </Button>

            <Button
              type="primary"
              icon={<DeleteOutlined />}
              onClick={openDeletePrompt}
              style={{
                backgroundColor: "var(--color-red)",
                borderColor: "var(--color-red)",
              }}
            >
              {t("translation.delete")}
            </Button>
          </Space>
        </div>

        {/* ADDED: Spin component wraps the Descriptions to show loading state */}
        <Card bordered={false} className="admin-card">
          <Spin spinning={isFetchingDetail} tip={t("loading") || "Loading..."}>
            <Descriptions
              bordered
              column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              size="middle"
              labelStyle={{
                width: "200px",
                fontWeight: "bold",
                backgroundColor: "#fafafa",
              }}
            >
              {columns.map((col: any) => {
                const value = viewingItem[col.dataIndex as keyof T];
                const renderedValue = col.render
                  ? col.render(value, viewingItem, 0)
                  : value;
                return (
                  <Descriptions.Item
                    key={col.key || col.dataIndex}
                    label={col.title}
                  >
                    {renderedValue}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </Spin>
        </Card>

        {viewExtraNode && (
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ margin: 0 }}>{t("Permissions")}</h2>
            <Spin spinning={isFetchingDetail}>
              {viewExtraNode(viewingItem)}
            </Spin>
          </div>
        )}

        <Button
          icon={
            <ArrowLeftOutlined
              style={isRtl ? { transform: "rotate(180deg)" } : {}}
            />
          }
          onClick={handleBackToTable}
          type="primary"
          style={{ marginTop: "2rem", fontSize: "16px" }}
        >
          {t("crud.back_to_list")}
        </Button>

        <Modal
          title={t("crud.edit_item", { title })}
          open={isEditModalOpen}
          onOk={handleEditOk}
          onCancel={() => setIsEditModalOpen(false)}
          okText={t("crud.save_changes")}
          cancelText={t("common.cancel")}
          width="90%"
          style={{ maxWidth: 600 }}
          centered
        >
          <Form form={form} layout="vertical" style={formStyle}>
            {renderFormItems
              ? renderFormItems({
                  mode: editingItem ? "edit" : "create",
                  record: editingItem,
                })
              : formItems}
          </Form>
        </Modal>

        <Modal
          title={t("deleteModal.title")}
          open={isDeleteModalOpen}
          onOk={verifyDeleteInput}
          onCancel={() => setIsDeleteModalOpen(false)}
          okText={t("deleteModal.ok")}
          cancelText={t("deleteModal.cancel")}
          okButtonProps={{
            style: {
              backgroundColor: "var(--color-red)",
              borderColor: "var(--color-red)",
            },
          }}
          centered
        >
          <div style={{ paddingTop: 10, paddingBottom: 10 }}>
            <Text>
              {t("deleteModal.confirmText")}{" "}
              <Text strong copyable>{t("deleteModal.keyword")}</Text>
            </Text>

            <Input
              style={{ marginTop: 15 }}
              placeholder={t("deleteModal.placeholder")}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              onPressEnter={verifyDeleteInput}
            />
          </div>
        </Modal>
      </div>
    );
  }

  // ==============================
  // LIST VIEW
  // ==============================
  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div
        className="page-header-row"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2 className="page-title"></h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Input
            placeholder={t("crud.search_placeholder")}
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => onSearch?.(e.target.value)}
            style={{ flex: 1, minWidth: 150 }}
          />

          {!disableAdd && (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              size="large"
              onClick={openAddModal}
            >
              {t("crud.add_new", { title })}
            </Button>
          )}
        </div>
      </div>

      <div className="admin-card compact-table-wrapper">
        <AppTable
          title={() => <Typography.Title level={3}>{title}</Typography.Title>}
          className="super-compact-table"
          size={tableSize}
          skeletonLoading={isLoading}
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
          pagination={
            isLoading
              ? false
              : {
                  position: ["bottomRight"],
                  current: pageIndex,
                  pageSize: pageSize,
                  total: total,
                  showSizeChanger: true,
                  className: "custom-pagination",
                  onChange: (page, pSize) => {
                    onPageChange?.(page, pSize);
                  },
                }
          }
        />
      </div>

        <Modal
          title={t("crud.add_new", { title })}
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText={t("crud.create")}
        cancelText={t("common.cancel")}
        width="90%"
        style={{ maxWidth: 600 }}
          centered
        >
          <Form form={form} layout="vertical" style={formStyle}>
            {renderFormItems
              ? renderFormItems({
                  mode: editingItem ? "edit" : "create",
                  record: editingItem,
                })
              : formItems}
          </Form>
        </Modal>
    </div>
  );
};
