/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { DatePicker, Card, Tag, Flex, Pagination, Select, Typography, Popover } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, ClockCircleOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuditLogs, useAuditLookups, useUserLookup } from '../Hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';
import EllipsisComponent from '../../../components/EllipsisComponent';
import AppTable from '../../../components/AppTable';
import i18next from 'i18next';

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
            key: 'summary',
            width: 300,
            render: (text: string) => (
                <div onClick={(e) => e.stopPropagation()}>

                    <Popover
                        title={t('audit.summary')}
                        content={<div style={{ maxWidth: 400, fontFamily: 'monospace' }}>{text}</div>}
                        trigger="hover"
                        placement="topLeft"
                    >
                        <EllipsisComponent content={text} />
                    </Popover>
                </div>
            ),
        },
        {
            title: t('audit.userName'),
            dataIndex: ['actor', 'full_name'],
            render: (text: any) => {
                console.log(text);
                return `${text.first[i18next.language]} ${text.mid[i18next.language]} ${text.last[i18next.language]}`
            },
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
                            label: u.first_name + ' ' + u.mid_name + ' ' + u.last_name 
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
            render: (date: string) =>
            (
                <Flex align="center" gap="middle">
                    <Flex align="center" gap="small">
                        <Typography.Text type="secondary">
                            {dayjs(date).format('hh:mm A')}
                        </Typography.Text>
                        <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                    </Flex>

                    <Flex align="center" gap="small">
                        <Typography.Text type="secondary">
                            {dayjs(date).format('DD-MM-YYYY')}
                        </Typography.Text>
                        <CalendarOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                    </Flex>
                </Flex>
            ),
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
                        showTime={{ format: 'HH:mm A' }}
                        format="YYYY-MM-DD / HH:mm A"
                        placeholder={[t('common.startDate'), t('common.endDate')]}
                        onChange={(values) => {
                            setFilters(prev => ({
                                ...prev,
                                from: values ? values[0]!.format('hh:mm A / DD-mm-YYYY') : undefined,
                                to: values ? values[1]!.format('hh:mm A / DD-mm-YYYY') : undefined,
                                page: 1
                            }));
                        }}
                    />
                </Flex>

                <AppTable
                    dataSource={data?.data || []}
                    columns={columns}
                    skeletonLoading={isLoading}
                    rowKey="id"
                    pagination={false}
                    onRow={(record: any) => ({
                        onClick: () => navigate(`/settings/logs/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                />
            </Flex>
        </Card>
    );
};

export default AuditLogList;
