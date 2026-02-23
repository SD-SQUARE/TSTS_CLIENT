/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Pagination, Tooltip, Badge, Tag, Popover, Input, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import type { InputRef, TableColumnType } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

import type { UserListItem } from "../Types/users";
import { useDeleteUser, useUsers } from "../Hooks/useUsers";
import AvatarDisplay from "../../../components/AvatarDisplay";
import UserFormModal from "./UsersFormModal";
import { useNavigate } from "react-router-dom";
import BulkCreateModal from "./BulkCreateModal";

type SearchableDataIndex = `first_name` | `mid_name` | `last_name` | 'ssn';


export const UserList: React.FC<{ role: string }> = ({ role }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentLanguage = i18n.language;
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState<SearchableDataIndex | ''>('');
    const searchInput = useRef<InputRef>(null);

    const [apiSearchQuery, setApiSearchQuery] = useState<{ [key: string]: string }>({});

    const { data, isLoading } = useUsers(role, pagination.page, pagination.pageSize, apiSearchQuery);
    const deleteMutation = useDeleteUser(role);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserListItem | undefined>();

    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: SearchableDataIndex,
    ) => {
        confirm();
        const newSearchText = selectedKeys[0];
        setSearchText(newSearchText);
        setSearchedColumn(dataIndex);
        setApiSearchQuery(prev => ({ ...prev, [dataIndex]: newSearchText }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleReset = (clearFilters: () => void, dataIndex: SearchableDataIndex) => {
        clearFilters();
        setSearchText('');
        setApiSearchQuery(prev => {
            const newState = { ...prev };
            delete newState[dataIndex];
            return newState;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getColumnSearchProps = (dataIndex: SearchableDataIndex, titleKey: string): TableColumnType<UserListItem> => ({

        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${t(titleKey)}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => {
            const isFilteredByApi = !!apiSearchQuery[dataIndex];
            return <SearchOutlined style={{ color: isFilteredByApi ? '#1677ff' : undefined }} />
        },
        render: (text: string) =>
            searchedColumn === dataIndex && searchText ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });


    const handleAdd = () => { setEditingUser(undefined); setIsModalVisible(true); };
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
    const handleEdit = (user: UserListItem) => { setEditingUser(user); setIsModalVisible(true); };
    const handleDelete = async (id: string) => {
        try { await deleteMutation.mutateAsync(id); message.success(t("translation.user_deleted_success")); }
        catch { message.error(t("translation.user_deleted_error")); }
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                    <Input
                        placeholder={`${t("common.search")}...`}
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => {
                            const val = selectedKeys[0] as string;
                            setApiSearchQuery(prev => ({
                                ...prev,
                                first_name: val,
                                mid_name: val,
                                last_name: val
                            }));
                            confirm();
                        }}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<SearchOutlined />}
                            style={{ width: 90 }}
                            onClick={() => {
                                const val = selectedKeys[0] as string;
                                setApiSearchQuery(prev => ({
                                    ...prev,
                                    first_name: val,
                                    mid_name: val,
                                    last_name: val
                                }));
                                confirm();
                            }}
                        >
                            {t("common.search")}
                        </Button>
                        <Button
                            size="small"
                            style={{ width: 90 }}
                            onClick={() => {
                                setApiSearchQuery(prev => {
                                    const newState = { ...prev };
                                    delete newState.first_name;
                                    delete newState.mid_name;
                                    delete newState.last_name;
                                    return newState;
                                });
                                clearFilters?.();
                                confirm();
                            }}
                        >
                            {t("common.reset")}
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            render: (_, record) => {
                const fullName = record[`full_name_${currentLanguage}`] || "";
                return (
                    <Typography.Text strong>
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[apiSearchQuery.first_name || '']}
                            autoEscape
                            textToHighlight={fullName}
                        />
                    </Typography.Text>
                );
            },
        },
        {
            title: t("user_list.ssn"),
            dataIndex: "ssn",
            key: "ssn",
            ...getColumnSearchProps('ssn', "user_list.ssn")
        },

        {
            title: t("user_list.phone"),
            dataIndex: ["contacts", "phones"],
            key: "phones",
            render: (phones: string[]) =>
                renderExpandList(phones, t("user_list.phone")),
        },
        {
            title: t("user_list.mobile"),
            dataIndex: ["contacts", "mobiles"],
            key: "mobiles",
            render: (mobiles: string[]) =>
                renderExpandList(mobiles, t("user_list.mobile")),
        },
        { title: t("user_list.job_title"), dataIndex: `job_${currentLanguage}`, key: "job" },
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
        }] : []),
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
        }]),
        // {
        //       title: t("user_list.perm_prof"),
        //       dataIndex: "permission_profile",
        //       key: "permission_profile",
        //       render: (profile: any) => profile ? <AvatarDisplay member={profile} /> : "-",
        // },
        {
            title: t("user_list.email"),
            dataIndex: "email",
            key: "email",
        },
        // {
        //     title: t("user_list.operations"),
        //     key: "operations",
        //     fixed: "right",
        //     width: 125,
        //     render: (_, record) => (

        //         <Space size={4}>
        //             <Tooltip title={t('translation.edit')} placement="topLeft">
        //                 <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />


        //             </Tooltip>
        //             <Tooltip title={t('translation.view')} placement="topLeft">
        //                 <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
        //             </Tooltip>

        //             <Popconfirm
        //                 title={t('translation.confirm_delete')}
        //                 onConfirm={() => handleDelete(record.id)}
        //                 okText={t('translation.yes')}
        //                 cancelText={t('translation.no')}

        //                 disabled={deleteMutation.isPending}
        //             >
        //                 <Tooltip title={t('translation.delete')} placement="topLeft">
        //                     <Button icon={<DeleteOutlined />} danger loading={deleteMutation.isPending} />


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

            <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                loading={isLoading || deleteMutation.isPending}
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