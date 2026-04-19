import React, { useState, useEffect } from "react";
import { Button, Space, Pagination, Typography, Tag, Popover } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import Highlighter from 'react-highlight-words';
import { useNavigate } from "react-router-dom";

import type { UserListItem, Lookup } from "../Types/users";
import { useDeleteUser, useUsers, useUniversities, useAllDomains, useAllDepartments } from "../Hooks/useUsers";
import AvatarDisplay from "../../../components/AvatarDisplay";
import AppTable from "../../../components/AppTable";
import UserFormModal from "./UsersFormModal";
import BulkCreateModal from "./BulkCreateModal";
import { getServerTextFilterProps, getServerSelectFilterProps } from "../../../components/table/serverFilters";

export const UserList: React.FC<{ role: string }> = ({ role }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentLanguage = i18n.language as "en" | "ar";
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });

    const [apiSearchQuery, setApiSearchQuery] = useState<any>({});

    const { data: universities } = useUniversities();
    const { data: domains } = useAllDomains();
    const { data: departments } = useAllDepartments();

    const uniOptions = universities?.map((u: Lookup) => ({ label: (currentLanguage === 'ar' ? u.name_ar : u.name_en) || u.name, value: u.id })) || [];
    const domainOptions = domains?.map((d: Lookup) => ({ label: (currentLanguage === 'ar' ? d.name_ar : d.name_en) || d.name, value: d.id })) || [];
    const deptOptions = departments?.map((d: Lookup) => ({ label: (currentLanguage === 'ar' ? d.name_ar : d.name_en) || d.name, value: d.id })) || [];

    const { data, isLoading } = useUsers(role, pagination.page, pagination.pageSize, apiSearchQuery);
    const deleteMutation = useDeleteUser(role);

    const resetToFirstPage = () => setPagination(prev => ({ ...prev, page: 1 }));



    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserListItem | undefined>();

    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);

    const handleAdd = () => { setEditingUser(undefined); setIsModalVisible(true); };
    const handleResetAll = () => {
        setApiSearchQuery({});
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    useEffect(() => {
        handleResetAll();
    },[role])

    const handleView = (id: string) => {
        navigate(`/identities/users/${role}/${id}`);
    };
    const handleRowClick = (record: UserListItem) => {
        return {
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                const target = event.target as HTMLElement;
                const isInteractive = target.closest('button, a, .ant-popconfirm, .ant-popover-open, .ant-tooltip-open');

                if (!isInteractive) {
                    handleView(record.id);
                }
            },
            style: { cursor: 'pointer' },
        };
    };

    const handleCloseModal = () => { setIsModalVisible(false); setEditingUser(undefined); };

    const renderExpandList = (item: string[], titleKey: string) => {
        if (!item || item.length === 0) {
            return "-";
        }

        const firstItem = item[0];
        const remainingItems = item.slice(1);
        const remainingCount = remainingItems.length;

        const popoverContent = (
            <div style={{ padding: '4px 0' }}>
                {remainingItems.map((c, i) => <div key={i} style={{ marginBottom: 4 }}>{c}</div>)}
            </div>
        );

        return (
            <Space size={8}>
                <span>{firstItem}</span>

                {remainingCount > 0 && (
                    <Popover
                        content={popoverContent}
                        title={t(titleKey)}
                        trigger="hover"
                        placement="right"
                    >
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            +{remainingCount}
                            {/* <DownOutlined style={{ fontSize: '10px', marginLeft: 4 }} /> */}
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
            fixed: "left",
            width: 60,
            render: (_, __, index) => {
                return (
                    (pagination.page - 1) * pagination.pageSize + index + 1
                );
            },
        },
        {
            title: t("user_list.full_name"),
            key: "full_name",
            fixed: "left",
            width: 250,
            render: (_: string, record: UserListItem) => {
                let displayName = record[`full_name_${currentLanguage}`] || "";

                if (displayName === "" || !displayName)
                {
                    const firstName = record?.[`first_name_${currentLanguage}`] || '';
                    const midName = record?.[`mid_name_${currentLanguage}`] || '';
                    const lastName = record?.[`last_name_${currentLanguage}`] || '';
                    displayName = `${firstName} ${midName} ${lastName}`.trim();
                }
                return (
                    <Typography.Text strong>
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[apiSearchQuery.first_name || '']}
                            autoEscape
                            textToHighlight={displayName}
                        />
                    </Typography.Text>
                );
            },
            ...getServerTextFilterProps<UserListItem, any>({
                filterKey: "first_name",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.name")}`,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("user_list.email"),
            dataIndex: "email",
            key: "email",
            width: 200,
            ...getServerTextFilterProps<UserListItem, any>({
                filterKey: "email",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.email")}`,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("user_list.ssn"),
            dataIndex: "ssn",
            key: "ssn",
            width: 150,
            ...getServerTextFilterProps<UserListItem, any>({
                filterKey: "ssn",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.ssn")}`,
                onChange: resetToFirstPage,
            }),
        },

        {
            title: t("user_list.phone"),
            dataIndex: ["contacts", "phones"],
            key: "phones",
            width: 150,
            render: (phones: string[]) =>
                renderExpandList(phones, t("user_list.phone")),
            ...getServerTextFilterProps<UserListItem, any>({
                filterKey: "phone",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.phone")}`,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("user_list.mobile"),
            dataIndex: ["contacts", "mobiles"],
            key: "mobiles",
            width: 150,
            render: (mobiles: string[]) =>
                renderExpandList(mobiles, t("user_list.mobile")),
            ...getServerTextFilterProps<UserListItem, any>({
                filterKey: "mobile",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.mobile")}`,
                onChange: resetToFirstPage,
            }),
        },
        { 
            title: t("user_list.job_title"), 
            dataIndex: `job_${currentLanguage}`, 
            key: "job",
            width: 150,
            ...getServerTextFilterProps<UserListItem, any>({
                filterKey: "job_title",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.job_title")}`,
                onChange: resetToFirstPage,
            }),
        },
        ...(role !== "requesters" ? [{
            title: t("user_list.group"),
            dataIndex: "groups",
            key: "groups",
            render: (groups: any[]) => {
                if (!groups || groups.length === 0) {
                    return "-";
                }

                const nameKey = `name_${currentLanguage}`;

                return (
                    <Space size="small">
                        {groups
                            .filter(Boolean)
                            .map((group) => {
                                const localizedGroup = {
                                    ...group,
                                    name: group[nameKey] || group.name,
                                };
                                return (
                                    <AvatarDisplay key={localizedGroup.id} member={localizedGroup} />
                                );
                            })}
                    </Space>
                );
            },
        } as any] : []),
        {
            title: t("user_list.university"),
            key: "university",
            render: (_: any, user: UserListItem) => user.university?.name ?? "-",
            ...getServerSelectFilterProps<UserListItem, any>({
                filterKey: "universities",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.university")}`,
                options: uniOptions,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("user_list.domain"),
            key: "domain",
            render: (_: any, user: UserListItem) => user.domain?.name ?? "-",
            ...getServerSelectFilterProps<UserListItem, any>({
                filterKey: "domains",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.domain")}`,
                options: domainOptions,
                onChange: resetToFirstPage,
            }),
        },
        ...(role !== "requesters" ? [] : [{
            title: t("user_list.department"),
            dataIndex: "departments",
            key: "departments",
            render: (departments: any[]) => {
                if (!departments || departments.length === 0) {
                    return "-";
                }

                const nameKey = `name_${currentLanguage}`;

                const departmentNames = departments
                    .filter(Boolean)
                    .map((department) => department[nameKey] || department.name);

                return renderExpandList(departmentNames, "user_list.department");
            },
            ...getServerSelectFilterProps<UserListItem, any>({
                filterKey: "departments",
                filters: apiSearchQuery,
                setFilters: setApiSearchQuery,
                placeholder: `${t("common.search")} ${t("user_list.department")}`,
                options: deptOptions,
                onChange: resetToFirstPage,
            }),
        } as any]),
        // {
        //     title: t("user_list.operations"),
        //     key: "operations",
        //     fixed: "right",
        //     width: 125,
        //     render: (_: any, record: UserListItem) => (
        // 
        //         <Space size={4}>
        //             <Tooltip title={t('translation.edit')} placement="topLeft">
        //                 <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        // 
        // 
        //             </Tooltip>
        //             <Tooltip title={t('translation.view')} placement="topLeft">
        //                 <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
        //             </Tooltip>
        // 
        //             <Popconfirm
        //                 title={t('translation.confirm_delete')}
        //                 onConfirm={() => handleDelete(record.id)}
        //                 okText={t('translation.yes')}
        //                 cancelText={t('translation.no')}
        // 
        //                 disabled={deleteMutation.isPending}
        //             >
        //                 <Tooltip title={t('translation.delete')} placement="topLeft">
        //                     <Button icon={<DeleteOutlined />} danger loading={deleteMutation.isPending} />
        // 
        // 
        //                 </Tooltip>
        //             </Popconfirm>
        //         </Space>
        //     ),
        // }
    ];

    return (
        <div >
            <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
                <Pagination
                    current={pagination.page}
                    pageSize={pagination.pageSize}
                    total={data?.total || 0}
                    onChange={(page, pageSize) => setPagination({ page, pageSize })}
                    showSizeChanger
                />
                <Space >
                    {role === "requesters" && (
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => setIsBulkModalVisible(true)}
                        >
                            {t("bulk.upload_sample")}
                        </Button>
                    )}
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        {t("Add_User")}
                    </Button>
                </Space>
            </Space>

            <AppTable
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                skeletonLoading={isLoading}
                loading={deleteMutation.isPending}
                scroll={{ x: "max-content", y: "calc(100vh - 200px)" }}
                pagination={false}
                onRow={handleRowClick}
            />


            {/* <Pagination
                style={{ marginTop: 16, textAlign: "right", justifyContent: "flex-end" }}
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={data?.total || 0}
                onChange={(page, pageSize) => setPagination({ page, pageSize })}
                showSizeChanger
            /> */}


            <UserFormModal
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                userData={editingUser}
                role={role}
            />

            <BulkCreateModal
                visible={isBulkModalVisible}
                onClose={() => setIsBulkModalVisible(false)}
                role={role}
            />
        </div>
    );
};

export default UserList;
