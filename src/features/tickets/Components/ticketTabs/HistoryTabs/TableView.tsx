/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Avatar, Flex, Select, Space, Table, Tag, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../i18n';
import { useActionsLookup, useUsersLookup } from '../../../Hooks/useTicket';

interface Props {
    ticketId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any[];
    getIcon: (type: string, size?: number) => React.ReactNode;
    getColor: (type: string) => string;
    onUserSearch: (val: string | undefined) => void;
    onActionSearch: (val: string | undefined) => void;
    currentFilters: { user?: string; action?: string };
}

const formatHistoryValue = (value: unknown): string | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    return String(value);
};

const extractStatusPair = (value: any) => {
    if (!value || typeof value !== 'object') {
        return { oldValue: undefined, newValue: undefined };
    }

    return {
        oldValue: formatHistoryValue(value.oldStatus ?? value.oldValue),
        newValue: formatHistoryValue(value.newStatus ?? value.newValue),
    };
};

const getStatusChangeValues = (meta: any) => {
    if (!meta || typeof meta !== 'object') {
        return { oldValue: undefined, newValue: undefined };
    }

    const directMetaPair = {
        oldValue: formatHistoryValue(meta.oldStatus ?? meta.oldValue),
        newValue: formatHistoryValue(meta.newStatus ?? meta.newValue),
    };
    if (directMetaPair.oldValue || directMetaPair.newValue) {
        return directMetaPair;
    }

    const directStatusChangePair = extractStatusPair(meta?.statusChange);
    if (directStatusChangePair.oldValue || directStatusChangePair.newValue) {
        return directStatusChangePair;
    }

    const nestedContainers = [meta?.change, meta?.changes, meta?.statusChange];
    for (const container of nestedContainers) {
        if (!container || typeof container !== 'object') continue;

        for (const entry of Object.values(container)) {
            const { oldValue, newValue } = extractStatusPair(entry);
            if (oldValue || newValue) {
                return { oldValue, newValue };
            }
        }
    }

    return { oldValue: undefined, newValue: undefined };
};

const renderChangeTag = (value: string | undefined, color?: string) => {
    if (!value) return '-';

    return (
        <Tag color={color}>
            {value}
        </Tag>
    );
};

const TicketHistoryTable: React.FC<Props> = ({ ticketId, activities, getIcon, getColor, onUserSearch, onActionSearch, currentFilters }) => {
    const { t } = useTranslation();

    const { data: usersData } = useUsersLookup();
    const { data: actionsData } = useActionsLookup(ticketId);
    const actionOptions = Array.isArray(actionsData)
        ? actionsData
        : actionsData?.actions ?? [];

    const columns: any[] = [
        {
            title: t('tickets.user'),
            dataIndex: 'meta',
            key: 'user',
            width: 180,
            filterDropdown: () => (
                <div style={{ padding: 8, width: 250 }} onKeyDown={(e) => e.stopPropagation()}>
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('tickets.searchUser')}
                        style={{ width: 220 }}
                        value={currentFilters.user}
                        onChange={onUserSearch} 
                        optionFilterProp="label"
                    >
                        {usersData?.users?.map((u: any) => (
                            <Select.Option 
                                key={u.id} 
                                value={u.id} 
                                label={`${u.first_name} ${u.last_name}`}
                            >
                                <Flex align="center" gap="small">
                                    <Avatar size="small" src={u.image} />
                                    <Typography.Text >{u.first_name} {u.last_name}</Typography.Text>
                                </Flex>
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            render: (meta: any) => {
                if (!meta?.user) return '-';
    
                const displayName = i18n.language === 'ar'
                    ? meta.user.full_name_ar
                    : meta.user.full_name_en;
    
                return (
                    <Space>
                        <Avatar size="small" src={meta.user.image} />
                        <Typography.Text>{displayName || '-'}</Typography.Text>
                    </Space>
                );
            },
        },
        {
            title: t('tickets.type'),
            dataIndex: 'type',
            key: 'type',
            width: 150,
            filterDropdown: () => (
                <div style={{ padding: 8, width: 200 }} onKeyDown={(e) => e.stopPropagation()}>
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('tickets.searchAction')}
                        style={{ width: 180 }}
                        value={currentFilters.action}
                        onChange={onActionSearch}
                        optionFilterProp="label"
                    >
                        {actionOptions.map((action: any) => {
                            const actionType = action?.type ?? action?.name;

                            if (!actionType) return null;

                            return (
                                <Select.Option key={actionType} value={actionType} label={actionType}>
                                    {actionType}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </div>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            render: (type: string) => (
                <Tag color={getColor(type)} icon={getIcon(type, 12)}>
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: t('tickets.title'),
            dataIndex: 'title',
            key: 'title',
            width: 170,
            render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
        },
        {
            title: t('tickets.content'),
            dataIndex: 'content',
            key: 'content',
            width: 250,
            render: (text: string) => (
                <Typography.Paragraph
                    ellipsis={{ rows: 2, tooltip: text || '-' }}
                    style={{ marginBottom: 0, maxWidth: 250 }}
                >
                    {text || '-'}
                </Typography.Paragraph>
            ),
        },
        {
            title: t('tickets.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (date: string) => (
                <Flex vertical gap={4} dir="ltr" style={{ alignItems: 'flex-start' }}> 
                    <Space size={6} style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                        <ClockCircleOutlined />
                        <span dir='ltr'>{dayjs(date).format('h:mm A')}</span>
                    </Space>
                    <Space size={6} style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                        <CalendarOutlined />
                        <span dir='ltr'>{dayjs(date).format('DD-MM-YYYY')}</span>
                    </Space>
                </Flex>
            ),
        },
        {
            title: t('tickets.ipAddress'),
            dataIndex: 'meta',
            key: 'ip',
            width: 100,
            render: (meta: any) => (
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    {meta?.ip || '-'}
                </Typography.Text>
            ),
        },
        {
            title: t('tickets.state'),
            key: 'state_group',
            align: 'center',
            children: [
                {
                    title: t('common.old'),
                    dataIndex: 'meta',
                    key: 'old_state',
                    width: 100,
                    align: 'center',
                    render: (meta: any) => {
                        const { oldValue } = getStatusChangeValues(meta);
                        return renderChangeTag(oldValue);
                    },
                },
                {
                    title: t('common.new'),
                    dataIndex: 'meta',
                    key: 'newStatus',
                    width: 100,
                    align: 'center',
                    render: (meta: any) => {
                        const { newValue } = getStatusChangeValues(meta);
                        return renderChangeTag(newValue, 'blue');
                    },
                },
            ],
        },
    ];

    return (
        <Table
            dataSource={activities}
            columns={columns}
            rowKey="id"
            bordered
            size="small"
            pagination={{ 
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                style: { marginTop: '20px' },
            }}
        />
    );
};

export default TicketHistoryTable;
