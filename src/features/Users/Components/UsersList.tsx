/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, message, Pagination, Tooltip, Badge, Tag, Popover } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";

import type { UserListItem } from "../Types/users";
import { useDeleteUser, useUsers } from "../Hooks/useUsers";
import AvatarDisplay from "../../../components/AvatarDisplay";
import UserFormModal from "./UsersFormModal";




export const UserList: React.FC<{ role: string }> = ({ role }) => {
    const { t } = useTranslation();
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
    const { data, isLoading } = useUsers(role, pagination.page, pagination.pageSize);
    const deleteMutation = useDeleteUser(role);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserListItem | undefined>();

    const handleAdd = () => { setEditingUser(undefined); setIsModalVisible(true); };
    const handleView = (id: string) => {

        console.log(`Maps to view page for ID: ${id}`);
    }; const handleEdit = (user: UserListItem) => { setEditingUser(user); setIsModalVisible(true); };
    const handleDelete = async (id: string) => {
        try { await deleteMutation.mutateAsync(id); message.success(t("translation.user_deleted_success")); }
        catch { message.error(t("translation.user_deleted_error")); }
    };
    const handleCloseModal = () => { setIsModalVisible(false); setEditingUser(undefined); };

    const renderContactList = (contacts: string[], titleKey: string) => {
        if (!contacts || contacts.length === 0) {
            return "-";
        }

        const firstContact = contacts[0];
        const remainingContacts = contacts.slice(1);
        const remainingCount = remainingContacts.length;

        // Content for the Popover (the list of all extra numbers)
        const popoverContent = (
            <div style={{ padding: '4px 0' }}>
                {remainingContacts.map((c, i) => <div key={i} style={{ marginBottom: 4 }}>{c}</div>)}
            </div>
        );

        return (
            <Space size={8}>
                {/* 1. Display the first contact number */}
                <span>{firstContact}</span>

                {/* 2. Clickable Overflow Indicator */}
                {remainingCount > 0 && (
                    <Popover
                        content={popoverContent}
                        title={t(titleKey)}
                        trigger="click" // Open/close on click
                        placement="right"
                    >
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            +{remainingCount}
                            {/* Add the arrow icon next to the count */}
                            <DownOutlined style={{ fontSize: '10px', marginLeft: 4 }} />
                        </Tag>
                    </Popover>
                )}
            </Space>
        );
    };


    const columns: ColumnsType<UserListItem> = [
        {
            title: t("translation.id"),
            dataIndex: "rowIndex",
            key: "rowIndex",
            render: (_: any, record: UserListItem, index: number) => (
                <Badge
                    offset={[-12, 6]}
                    status={record.status === "Active" ? "success" : "warning"}
                    text={(pagination.page - 1) * pagination.pageSize + index + 1}
                />
            ),
            fixed: "left",
            width: 60,
        },

        { title: t("user_list.fname"), dataIndex: "first_name", key: "first_name" },
        { title: t("user_list.mname"), dataIndex: "mid_name", key: "mid_name" },
        { title: t("user_list.lname"), dataIndex: "last_name", key: "last_name" },
        { title: t("user_list.ssn"), dataIndex: "ssn", key: "ssn" },

        {
            title: t("user_list.phone"),
            dataIndex: ["contacts", "phones"],
            key: "phones",
            render: (phones: string[]) =>
                renderContactList(phones, t("user_list.phone")),
        },
        {
            title: t("user_list.mobile"),
            dataIndex: ["contacts", "mobiles"],
            key: "mobiles",
            render: (mobiles: string[]) =>
                renderContactList(mobiles, t("user_list.mobile")),
        },
        { title: t("user_list.job_title"), dataIndex: "job", key: "job" },
        {
            title: t("user_list.university"),
            dataIndex: ["university", "name"],
            key: "university",
            render: (_, user) => user.university?.name ?? "-"
        },
        {
            title: t("user_list.domain"),
            dataIndex: ["domain", "name"],
            key: "domain",
            render: (_, user) => user.domain?.name ?? "-"
        },
        {
            title: t("user_list.department"),
            dataIndex: "departments",
            key: "departments",
            render: (departments: any[], user: UserListItem) => (
                <Space size="small">
                    {departments

                        .filter(Boolean)
                        .map((department) => (
                            <AvatarDisplay key={department.id} member={department} />
                        ))}
                </Space>
            ),
        },
        {
            title: t("user_list.perm_prof"),
            dataIndex: "permission_profile",
            key: "permission_profile",
            render: (profile: any) => profile ? <AvatarDisplay member={profile} /> : "-",
        },
        { title: t("user_list.email"), dataIndex: "email", key: "email" },
        {
            title: t("user_list.operations"),
            key: "operations",
            fixed: "right",
            width: 125,
            render: (_, record) => (

                <Space size={4}>
                    <Tooltip title={t('translation.edit')} placement="topLeft">
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />


                    </Tooltip>
                    <Tooltip title={t('translation.view')} placement="topLeft">
                        <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
                    </Tooltip>

                    <Popconfirm
                        title={t('translation.confirm_delete')}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t('translation.yes')}
                        cancelText={t('translation.no')}

                        disabled={deleteMutation.isPending}
                    >
                        <Tooltip title={t('translation.delete')} placement="topLeft">
                            <Button icon={<DeleteOutlined />} danger loading={deleteMutation.isPending} />


                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
                <Pagination
                    current={pagination.page}
                    pageSize={pagination.pageSize}
                    total={data?.total || 0}
                    onChange={(page, pageSize) => setPagination({ page, pageSize })}
                    showSizeChanger
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t("Add User")}</Button>
            </Space>

            <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                loading={isLoading || deleteMutation.isPending}
                scroll={{ x: "max-content" }}
                pagination={false}
            />


            <Pagination
                style={{ marginTop: 16, textAlign: "right", justifyContent: "flex-end" }}
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={data?.total || 0}
                onChange={(page, pageSize) => setPagination({ page, pageSize })}
                showSizeChanger
            />


            <UserFormModal
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                userData={editingUser}
                role={role}
            />
        </div>
    );
};

export default UserList;
