/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, DatePicker, Card, Tag, Flex, Pagination, Typography, Popover, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, ClockCircleOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuditLogs, useAuditLookups, useUserLookup } from '../Hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';
import EllipsisComponent from '../../../components/EllipsisComponent';
import AppTable from '../../../components/AppTable';
import type { ColumnsType } from 'antd/es/table';
import {
    getServerSelectFilterProps,
    getServerTextFilterProps,
} from '../../../components/table/serverFilters';

const { RangePicker } = DatePicker;
type DateFilterDropdownProps = { confirm: () => void; clearFilters?: () => void };

const AuditLogList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        from: undefined as string | undefined,
        to: undefined as string | undefined,
        actorId: undefined as string | undefined,
        action: undefined as string | undefined,
        status: undefined as string | undefined,
        summary: undefined as string | undefined,
    });

    const { data, isLoading } = useAuditLogs(filters);
    const { data: actions } = useAuditLookups();
    const { data: users } = useUserLookup();

    const renderEllipsisCell = (title: string, value?: string) => {
        const text = value?.trim() || '-';

        return (
            <div onClick={(event) => event.stopPropagation()}>
                <Popover
                    title={title}
                    content={<div style={{ maxWidth: 420, wordBreak: 'break-word' }}>{text}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <div style={{ width: '100%' }}>
                        <EllipsisComponent
                            content={<span style={{ whiteSpace: 'nowrap' }}>{text}</span>}
                            copyable={text !== '-'}
                        />
                    </div>
                </Popover>
            </div>
        );
    };

    const getActorDisplayName = (fullName: any) => {
        if (typeof fullName === 'string' && fullName.trim()) {
            return fullName;
        }

        if (fullName && typeof fullName === 'object') {
            const first = typeof fullName.first === 'object' ? fullName.first?.[i18n.language] : fullName.first;
            const mid = typeof fullName.mid === 'object' ? fullName.mid?.[i18n.language] : fullName.mid;
            const last = typeof fullName.last === 'object' ? fullName.last?.[i18n.language] : fullName.last;
            return [first, mid, last].filter(Boolean).join(' ').trim() || '-';
        }

        return '-';
    };

    const columns: ColumnsType<any> = [
        {
            title: t('audit.summary'),
            dataIndex: 'summary',
            key: 'summary',
            width: 320,
            render: (text: string) => renderEllipsisCell(t('audit.summary'), text),
            ...getServerTextFilterProps({
                filterKey: 'summary',
                filters,
                setFilters,
                placeholder: `${t('common.search')} ${t('audit.summary')}`,
                onChange: () => setFilters(prev => ({ ...prev, page: 1 })),
            }),
        },
        {
            title: t('audit.userName'),
            dataIndex: ['actor', 'full_name'],
            width: 220,
            render: (text: any) => renderEllipsisCell(t('audit.userName'), getActorDisplayName(text)),
            key: 'actorId',
            ...getServerSelectFilterProps({
                filterKey: 'actorId',
                filters,
                setFilters,
                placeholder: t('audit.filterByUser'),
                options: (Array.isArray(users) ? users : []).map((u: any) => ({
                    value: u.id,
                    label: `${u.first_name} ${u.mid_name} ${u.last_name}`,
                })),
                onChange: () => setFilters(prev => ({ ...prev, page: 1 })),
            }),
        },
        {
            title: t('audit.action'),
            dataIndex: 'action',
            key: 'action',
            width: 240,
            render: (action: string) => renderEllipsisCell(t('audit.action'), action),
            ...getServerSelectFilterProps({
                filterKey: 'action',
                filters,
                setFilters,
                placeholder: t('audit.filterByAction'),
                options: (Array.isArray(actions) ? actions : []).map((a: any) => ({
                    value: a.key,
                    label: a.name,
                })),
                onChange: () => setFilters(prev => ({ ...prev, page: 1 })),
            }),
        },
        {
            title: t('audit.status'),
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: string) => (
                <Tag color={status === 'SUCCESS' ? 'green' : 'red'} style={{ whiteSpace: 'nowrap' }}>
                    {status || '-'}
                </Tag>
            ),
            ...getServerSelectFilterProps({
                filterKey: 'status',
                filters,
                setFilters,
                placeholder: t('audit.status'),
                options: [
                    { value: 'SUCCESS', label: 'SUCCESS' }, 
                    { value: 'FAILED', label: 'FAILED' },
                ],
                onChange: () => setFilters(prev => ({ ...prev, page: 1 })),
            }),
        },
        {
            title: t('audit.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 220,
            render: (date: string) =>
            (
                <Flex align="center" gap="middle" style={{ whiteSpace: 'nowrap' }}>
                    <Flex align="center" gap="small" style={{ whiteSpace: 'nowrap' }}>
                        <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                        <Typography.Text type="secondary">
                            {dayjs(date).format('hh:mm A')}
                        </Typography.Text>
                    </Flex>

                    <Flex align="center" gap="small" style={{ whiteSpace: 'nowrap' }}>
                        <CalendarOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                        <Typography.Text type="secondary">
                            {dayjs(date).format('DD-MM-YYYY')}
                        </Typography.Text>
                    </Flex>
                </Flex>
            ),
            filteredValue: filters.from || filters.to ? [filters.from || filters.to] : null,
            filterDropdown: ({ confirm, clearFilters }: DateFilterDropdownProps) => (
                <div style={{ padding: 12 }}>
                    <RangePicker
                        showTime={{ format: 'HH:mm A' }}
                        format="YYYY-MM-DD / HH:mm A"
                        value={[
                            filters.from ? dayjs(filters.from) : null,
                            filters.to ? dayjs(filters.to) : null,
                        ]}
                        onChange={(values) => {
                            setFilters((prev) => ({
                                ...prev,
                                from: values?.[0] ? values[0].toISOString() : undefined,
                                to: values?.[1] ? values[1].toISOString() : undefined,
                                page: 1,
                            }));
                        }}
                    />
                    <Space style={{ marginTop: 8 }}>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => confirm()}
                        >
                            {t('common.filter')}
                        </Button>
                        <Button
                            size="small"
                            onClick={() => {
                                clearFilters?.();
                                setFilters((prev) => ({
                                    ...prev,
                                    from: undefined,
                                    to: undefined,
                                    page: 1,
                                }));
                                confirm();
                            }}
                        >
                            {t('common.reset')}
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
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
                </Flex>

                <AppTable
                    dataSource={data?.data || []}
                    columns={columns}
                    skeletonLoading={isLoading}
                    rowKey="id"
                    tableLayout="fixed"
                    scroll={{ x: 1140 }}
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
