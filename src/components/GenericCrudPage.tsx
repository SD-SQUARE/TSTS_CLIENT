import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Space,
  message,
  Input,
  Skeleton,
  Descriptions,
  Card,
  Typography,
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
import { mapRecordToFormValues, type FieldMapper } from "../utils/mapper";

const { Text } = Typography;

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
  nestedFieldMappers?: FieldMapper<T>;
  tableSize?: "small" | "middle" | "large";
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
  nestedFieldMappers = {},
  tableSize = "middle",
}: GenericCrudProps<T>) => {
  const [viewingItem, setViewingItem] = useState<T | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    if (viewingItem) {
      const updatedItem = data.find((d) => d.id === viewingItem.id);
      if (updatedItem) {
        setViewingItem(updatedItem);
      }
    }
  }, [data]);


  const handleApiErrors = (error: any) => {
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err: any) => {
        form.setFields([{ name: err.key, errors: [err.message] }]);
      });
    } else {
      message.error(error.message || "An unexpected error occurred");
    }
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: values });
        message.success(`${title} updated successfully`);
      } else {
        await createMutation.mutateAsync(values);
        message.success(`${title} created successfully`);
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
        message.success(`${title} deleted successfully`);
        setViewingItem(null);
      },
      onError: () => message.error("Delete failed"),
    });
  };


  const openDeletePrompt = () => {
    setDeleteInput(""); 
    setIsDeleteModalOpen(true);
  };

  const verifyDeleteInput = () => {
    if (deleteInput !== "delete") {
      message.error('You must type "delete" exactly to proceed.');
      return;
    }

    setIsDeleteModalOpen(false);

    Modal.confirm({
      title: 'Are you sure you want to delete this?',
      icon: <ExclamationCircleOutlined />,
      content: `This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        if (viewingItem) {
          executeDelete(viewingItem.id);
        }
      },
    });
  };


  const handleRowClick = (record: T) => {
    setViewingItem(record);
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

  if (viewingItem) {
    return (
      <div className="fade-in-animation">
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <h2 style={{ margin: 0 }}>{title} Details</h2>
          </Space>
          
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openEditModal(viewingItem)}
              style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
            >
              Edit
            </Button>
            
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              onClick={openDeletePrompt}
            >
              Delete
            </Button>
          </Space>
        </div>

        <Card bordered={false} className="admin-card">
          <Descriptions 
            bordered 
            column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }} 
            size="middle"
            labelStyle={{ width: '200px', fontWeight: 'bold', backgroundColor: '#fafafa' }}
          >
            {columns.map((col: any) => {
              const value = viewingItem[col.dataIndex as keyof T];
              const renderedValue = col.render 
                ? col.render(value, viewingItem, 0) 
                : value;
                
              return (
                <Descriptions.Item key={col.key || col.dataIndex} label={col.title}>
                  {renderedValue}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        </Card>
        <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToTable} 
              type="text"
              style={{marginTop:'2rem' ,fontSize: '16px', backgroundColor:'#cad8ec' }}
            >
              Back to List
        </Button>

        <Modal
          title={`Edit ${title}`}
          open={isEditModalOpen}
          onOk={handleEditOk}
          onCancel={() => setIsEditModalOpen(false)}
          okText="Save Changes"
          cancelText="Cancel"
          width="90%"
          style={{ maxWidth: 600 }}
          centered
        >
          <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
            {formItems}
          </Form>
        </Modal>

        <Modal
          title="Security Check"
          open={isDeleteModalOpen}
          onOk={verifyDeleteInput}
          onCancel={() => setIsDeleteModalOpen(false)}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          centered
        >
          <div style={{ paddingTop: 10, paddingBottom: 10 }}>
            <Text>To confirm deletion, please type <strong>"delete"</strong> below:</Text>
            <Input 
              style={{ marginTop: 15 }} 
              placeholder='Type "delete"'
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              onPressEnter={verifyDeleteInput}
            />
          </div>
        </Modal>
      </div>
    );
  }

  
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const skeletonRows = Array.from({ length: 6 }, (_, idx) => ({ 
    id: `loading-${idx}` 
  })) as T[];
  
  const skeletonColumns = columns.map((col) => ({
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
        <h2 className="page-title">{title} List</h2>

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

      <div className="admin-card compact-table-wrapper">
        <Table
          className="super-compact-table"
          size={tableSize}
          columns={isLoading ? skeletonColumns : columns}
          dataSource={isLoading ? skeletonRows : filteredData}
          rowKey="id"
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => !isLoading && handleRowClick(record),
            style: { cursor: isLoading ? "default" : "pointer" },
          })}
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
        title={`Add ${title}`}
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Create"
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