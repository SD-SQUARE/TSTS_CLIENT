
import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Pagination, Tooltip, Popover, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import GroupFormModal from './GroupFormModal';
import type { Group, NamedObject } from './Types/groups';
import AvatarDisplay from '../../components/AvatarDisplay';
import { useDeleteGroup, useGroups } from './Hooks/useGroups';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

const GroupsList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ellipsis, setEllipsis] = useState(true);

    const { data, isLoading } = useGroups(pagination.page, pagination.pageSize);
    const deleteMutation = useDeleteGroup();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);


    const handleAdd = () => {
        setEditingGroup(undefined);
        setIsModalVisible(true);
    };

    const handleEdit = (group: Group) => {
        setEditingGroup(group);
        setIsModalVisible(true);
    };

    const handleView = (id: string) => {
        navigate(`/groups/${id}`);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            message.success(t('translation.group_deleted_success'));

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            message.error(t('translation.group_deleted_error'));
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingGroup(undefined);
    };

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ page, pageSize });
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
        { title: t('translation.name_ar'), dataIndex: 'name_ar', key: 'nameArabic' },
        { title: t('translation.name_en'), dataIndex: 'name_en', key: 'nameEnglish' },
        {
            title: t('translation.description_ar'), dataIndex: 'description_ar', key: 'descriptionArabic', width: 200,
            render: (description: string) => (
                <Popover
                    title={t('translation.description_ar')}
                    content={<div style={{ maxWidth: 400 }}>{description}</div>} 
                    trigger="click" 
                    placement="topLeft"
                >
                    <Paragraph ellipsis={ellipsis ? { rows: 1, expandable: true, symbol: 'more' } : false}>{description}</Paragraph>
                    
                </Popover>
            ),
        },
        {
            title: t('translation.description_en'), dataIndex: 'description_en', key: 'descriptionEnglish', width: 200,
            render: (description: string) => (
                <Popover
                    title={t('translation.description_en')}
                    content={<div style={{ maxWidth: 400 }}>{description}</div>} 
                    trigger="click" 
                    placement="topLeft"
                >
                    <Paragraph ellipsis={ellipsis ? { rows: 1, expandable: true, symbol: 'more' } : false}>{description}</Paragraph>

                </Popover>
            ),
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
            title: t('translation.team_leader'),
            dataIndex: 'team_leader',
            key: 'teamLeaders',
            render: (leader: NamedObject) => (

                leader ? <AvatarDisplay member={leader} /> : null
            ),
        },
        {
            title: t('translation.specializations'),
            dataIndex: 'specializations',
            key: 'specializations',
            render: (specs: NamedObject[]) => (
                <Space size="small">
                    {specs

                        .filter(Boolean)
                        .map((spec) => (
                            <AvatarDisplay key={spec.id} member={spec} />
                        ))}
                </Space>
            ),
        },
        {
            title: t('translation.operations'),
            key: 'operations',
            width: 125,
            fixed: 'right',
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
        },
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

            <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                loading={isLoading || deleteMutation.isPending}
                scroll={{ x: 'max-content' }}
                pagination={false}
            />

            { }
            <Pagination
                style={{ marginTop: 16, textAlign: 'right', justifyContent: "flex-end" }}
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={data?.total || 0}
                onChange={handleTableChange}
                showSizeChanger
            />



            <GroupFormModal
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                groupData={editingGroup}
            />
        </div>
    );
};

export default GroupsList;

