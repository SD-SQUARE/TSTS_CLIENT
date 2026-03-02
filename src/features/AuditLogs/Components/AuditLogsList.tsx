/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, DatePicker, Card, Tag, Flex, Pagination, Select } from 'antd'; 
import { useNavigate } from 'react-router-dom';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuditLogs, useAuditLookups, useUserLookup } from '../Hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';

const { RangePicker } = DatePicker;

const AuditLogList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';

    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        from: undefined as string | undefined,
        to: undefined as string | undefined,
        actorId: undefined as string | undefined,
        action: undefined as string | undefined,
        status: undefined as string | undefined,
    });

    const { data, isLoading } = useAuditLogs(filters);
    const { data: actions } = useAuditLookups();
    const { data: users } = useUserLookup();

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const columns = [
        {
            title: t('audit.summary'),
            dataIndex: 'summary',
            key: 'summary'
        },
        {
            title: t('audit.userName'),
            dataIndex: ['actor', 'full_name'],
            key: 'actorId',
            filterDropdown: () => (
                <div style={{ padding: 12 }}> 
                    <Select
                        showSearch
                        placeholder={t('audit.filterByUser')}
                        style={{ width: 220 }} 
                        allowClear
                        optionFilterProp="children"
                        value={filters.actorId}
                        onChange={(val) => handleFilterChange('actorId', val)}
                        options={users?.map((u: any) => ({
                            value: u.id,
                            label: isAr ? u.full_name_ar : u.full_name_en
                        }))}
                    />
                </div>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        },
        {
            title: t('audit.action'),
            dataIndex: 'action',
            key: 'action',
            filterDropdown: () => (
                <div style={{ padding: 12 }}>
                    <Select
                        placeholder={t('audit.filterByAction')}
                        style={{ width: 200 }}
                        allowClear
                        value={filters.action}
                        onChange={(val) => handleFilterChange('action', val)}
                        options={actions?.map((a: any) => ({
                            value: a.key,
                            label: a.name
                        }))}
                    />
                </div>
            ),
            filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        },
        {
            title: t('audit.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={status === 'SUCCESS' ? 'green' : 'red'}>{status}</Tag>,
            filterDropdown: () => (
                <div style={{ padding: 12 }}>
                    <Select
                        placeholder={t('audit.status')}
                        style={{ width: 150 }}
                        allowClear
                        value={filters.status}
                        onChange={(val) => handleFilterChange('status', val)}
                        options={[
                            { value: 'SUCCESS', label: 'SUCCESS' },
                            { value: 'FAILURE', label: 'FAILURE' },
                        ]}
                    />
                </div>
            ),
            filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        },
        {
            title: t('audit.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    return (
        <Card title={t('audit.title')}>
            <Flex vertical gap="middle">
                <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                    <Pagination
                        size="small"
                        current={filters.page}
                        pageSize={filters.limit}
                        total={data?.pagination?.total || 0}
                        showSizeChanger
                        onChange={(page, limit) => setFilters(prev => ({ ...prev, page, limit }))}
                    />

                    <RangePicker
                        showTime
                        placeholder={[t('common.startDate'), t('common.endDate')]}
                        onChange={(values) => {
                            setFilters(prev => ({
                                ...prev,
                                from: values ? values[0]!.format('YYYY-MM-DDTHH:mm:ss') : undefined,
                                to: values ? values[1]!.format('YYYY-MM-DDTHH:mm:ss') : undefined,
                                page: 1
                            }));
                        }}
                    />
                </Flex>

                <Table
                    dataSource={data?.data || []}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    pagination={false}
                    onRow={(record: any) => ({
                        onClick: () => navigate(`/logs/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                />
            </Flex>
        </Card>
    );
};

export default AuditLogList;