import React, { useRef, useState } from 'react';
import { Button, Space,   Pagination,  Popover, Typography, Tag, Input } from 'antd';
import {    PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import type { InputRef, TableColumnType } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

import GroupFormModal from './GroupFormModal';
import type { Group, NamedObject } from './Types/groups';
import AvatarDisplay from '../../components/AvatarDisplay';
import AppTable from '../../components/AppTable';
import { useDeleteGroup, useGroups } from './Hooks/useGroups';
import { useNavigate } from 'react-router-dom';
import EllipsisComponent from '../../components/EllipsisComponent';


type SearchableDataIndex = 'name';

const GroupsList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState<SearchableDataIndex | ''>('');
    const searchInput = useRef<InputRef>(null);

    const [apiSearchQuery, setApiSearchQuery] = useState<{ [key: string]: string }>({});

    const { data, isLoading } = useGroups(pagination.page, pagination.pageSize, apiSearchQuery);
    const deleteMutation = useDeleteGroup();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);


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

    const getColumnSearchProps = (dataIndex: SearchableDataIndex): TableColumnType<Group> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${t(`translation.${dataIndex}`)}`}
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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


    const handleAdd = () => {
        setEditingGroup(undefined);
        setIsModalVisible(true);
    };

    // const handleEdit = (group: Group) => {
    //     setEditingGroup(group);
    //     setIsModalVisible(true);
    // };

    const handleView = (id: string) => {
        navigate(`/identities/groups/${id}`);
    };

    const handleRowClick = (record: Group) => {
        return {
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                const target = event.target as HTMLElement;
                const isInteractive = target.closest('button, a, .ant-popover-open, .ant-tooltip-open');
    
                if (!isInteractive) {
                    handleView(record.id);
                }
            },
            style: { cursor: 'pointer' }, 
        };
    };

    // const handleDelete = async (id: string) => {
    //     try {
    //         await deleteMutation.mutateAsync(id);
    //         message.success(t('translation.group_deleted_success'));

    //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     } catch (error) {
    //         message.error(t('translation.group_deleted_error'));
    //     }
    // };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingGroup(undefined);
    };

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ page, pageSize });
    };

    const renderSpecializations = (specs: NamedObject[]) => {
        if (!specs || specs.length === 0) {
            return <Typography.Text disabled>-</Typography.Text>;
        }

        return (
            <Space size={[0, 8]} wrap>
                {specs
                    .filter(Boolean)
                    .map((spec, index) => (
                        <Popover
                            key={spec.id || index}
                            title={t('translation.specialization_detail')}
                            content={<div style={{ maxWidth: 300, whiteSpace: 'normal' }}>{spec.name}</div>}
                            trigger="hover"
                            placement="topLeft"
                        >
                            <Tag
                                color="blue"
                                style={{ cursor: 'pointer', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', marginInlineEnd:4 }}
                            >
                                {spec.name.substring(0, 15)}...
                            </Tag>
                        </Popover>
                    ))}
            </Space>
        );
    };


    const columns: ColumnsType<Group> = [
        {
            title: t('translation.id'),
            dataIndex: 'rowIndex',
            key: 'rowIndex',
            width: 60,
            fixed: 'left',
            render: (_, __, index) => {
                return (
                    (pagination.page - 1) * pagination.pageSize + index + 1
                );
            },
        },
        {
            title: t('translation.name_ar'),
            dataIndex: 'name_ar',
            key: 'nameArabic',
            ...getColumnSearchProps('name'),
        },
        {
            title: t('translation.name_en'),
            dataIndex: 'name_en',
            key: 'nameEnglish',
            ...getColumnSearchProps('name'),
        },
        {
            title: t('translation.description_ar'),
            dataIndex: 'description_ar',
            key: 'descriptionArabic',
            width: 200,
            render: (description: string) => (
                <Popover
                    title={t('translation.description_ar')}
                    content={<div style={{ maxWidth: 400 }}>{description}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent content={description} />
                </Popover>
            ),
        },
        {
            title: t('translation.description_en'),
            dataIndex: 'description_en',
            key: 'descriptionEnglish',
            width: 200,
            render: (description: string) =>(
                <Popover
                    title={t('translation.description_en')}
                    content={<div style={{ maxWidth: 400 }}>{description}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent content={description} />

                </Popover>
            )
        
        },
        {
            title: t('translation.heads'),
            dataIndex: 'heads',
            key: 'heads',
            render: (heads: NamedObject[]) => (
                <Space size="small">
                    {heads
                        .filter(Boolean)
                        .map((head) => (
                            <AvatarDisplay key={head.id} member={head} />
                        ))}
                </Space>
            ),
        },
        {
            title: t('translation.team_leads', t('translation.team_leader')),
            dataIndex: 'team_leads',
            key: 'teamLeads',
            render: (leaders: NamedObject[]) => (
                <Space size="small">
                    {(leaders || [])
                        .filter(Boolean)
                        .map((leader) => (
                            <AvatarDisplay key={leader.id} member={leader} />
                        ))}
                </Space>
            ),
        },
        {
            title: t('translation.specializations'),
            dataIndex: 'specializations',
            key: 'specializations',
            render: renderSpecializations,
        },
        // {
        //     title: t('translation.operations'),
        //     key: 'operations',
        //     width: 125,
        //     fixed: 'right',
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
        // },
    ];


    return (
        <div>
            <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
                <Pagination
                    current={pagination.page}
                    pageSize={pagination.pageSize}
                    total={data?.total || 0}
                    onChange={handleTableChange}
                    showSizeChanger
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    {t('translation.add_group')}
                </Button>

            </Space>

            <AppTable
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                skeletonLoading={isLoading}
                loading={deleteMutation.isPending}
                scroll={{ x: 'max-content', y: "calc(100vh - 200px)" }}
                pagination={false}
                onRow={handleRowClick}
            />

            {/* <Pagination
                style={{ marginTop: 16, textAlign: 'right', justifyContent: "flex-end" }}
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={data?.total || 0}
                onChange={handleTableChange}
                showSizeChanger
            /> */}

            <GroupFormModal
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                groupData={editingGroup}
            />
        </div>
    );
};

export default GroupsList;
