import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Space,
  Popconfirm,
  message,
  Input,
  Skeleton,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface GenericCrudProps<T> {
  title: string;
  columns: ColumnsType<T>;
  formItems: React.ReactNode;
  
  data: T[];
  isLoading: boolean;
  
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  
  disableAdd?: boolean;
}

export const GenericCrudPage = <T extends { id: string | number }>({
  title,
  columns,
  formItems,
  data,
  isLoading,
  createMutation,
  updateMutation,
  deleteMutation,
  disableAdd = false,
}: GenericCrudProps<T>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // --------------- API ERROR HANDLING ----------------
  const handleApiErrors = (error: any) => {
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err: any) => {
        form.setFields([{ name: err.key, errors: [err.message] }]);
      });
    } else {
      message.error(error.message || "An unexpected error occurred");
    }
  };

  // --------------- MODAL HANDLERS ----------------
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: values });
        message.success(`${title} updated successfully`);
      } else {
        await createMutation.mutateAsync(values);
        message.success(`${title} created successfully`);
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
    } catch (err: any) {
      handleApiErrors(err);
    }
  };

  const handleDelete = (id: string | number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => message.success(`${title} deleted successfully`),
      onError: () => message.error("Delete failed"),
    });
  };

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: T) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // --------------- TABLE SETUP ----------------
  const tableColumns: ColumnsType<T> = [
    ...columns,
    {
      title: "Operations",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // --------------- SKELETON LOADING ----------------
  const skeletonRows = Array.from({ length: 6 }, (_, idx) => ({ 
    id: `loading-${idx}` 
  })) as T[];  const skeletonColumns = tableColumns.map((col) => ({
    ...col,
    render: () => <Skeleton.Input style={{ width: "100%", height: 12 }} active />,
  }));

  return (
    <div>
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
        <h2 className="page-title">{title}</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: 150 }}
          />

          {!disableAdd && (
            <Button
              icon={<PlusOutlined />}
              style={{ flexShrink: 0, backgroundColor: "#cad8ec" }}
              size="large"
              onClick={openAddModal}
            >
              Add {title}
            </Button>
          )}
        </div>
      </div>

      <div className="admin-card">
        <Table
          columns={isLoading ? skeletonColumns : tableColumns}
          dataSource={isLoading ? skeletonRows : filteredData}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={
            isLoading
              ? false
              : {
                  position: ["bottomRight"],
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`,
                }
          }
        />
      </div>

      <Modal
        title={editingItem ? `Edit ${title}` : `Add ${title}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingItem ? "Save Changes" : "Create"}
        cancelText="Cancel"
        width="90%"
        style={{ maxWidth: 600 }}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
};
