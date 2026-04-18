/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from 'react';
import { Button, Flex, Input, Popover, Select, Space, TreeSelect } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Highlighter from 'react-highlight-words';
import type { InputRef, TableColumnType } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import type { ColumnsType } from 'antd/es/table';
import type { TicketSearchQuery } from './useTicket';
import { getTicketIdentifierSearchKey } from '../Components/ticketListComponents/storageUtils';
import type { Problem, Specialization, Ticket } from '../Types/tickets';
import EllipsisComponent from '../../../components/EllipsisComponent';
import AssigneeColumnCell from '../Components/ticketListComponents/AssigneeColumnCell';

type SearchableDataIndex =
    | 'id'
    | 'title'
    | 'problem'
    | 'specialization'
    | 'status'
    | 'priority'
    | 'requester'
    | 'assignee'
    | 'university'
    | 'domain'
    | 'department';

interface UseTicketColumnsOptions {
    role: string | undefined;
    specs: any[];
    problemTreeData: any[];
    requesters: { label: string; value: string }[];
    assignees: { label: React.ReactNode; value: string, textLabel?: string }[];
    universities: { label: string; value: string }[];
    domains: { label: string; value: string }[];
    departments: { label: string; value: string }[];
    apiSearchQuery: TicketSearchQuery;
    setApiSearchQuery: React.Dispatch<React.SetStateAction<TicketSearchQuery>>;
    setPagination: React.Dispatch<React.SetStateAction<{ page: number; pageSize: number }>>;
    handleView: (id: string) => void;
}

export const useTicketColumns = ({
    role,
    specs,
    problemTreeData,
    requesters,
    assignees,
    universities,
    domains,
    departments,
    apiSearchQuery,
    setApiSearchQuery,
    setPagination,
    handleView,
}: UseTicketColumnsOptions) => {
    const { t } = useTranslation();
    const isRequester = role === 'requester';

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState<SearchableDataIndex | ''>('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: SearchableDataIndex,
    ) => {
        confirm();
        const queryValue = selectedKeys.length > 0 ? selectedKeys : undefined;
        setSearchText(selectedKeys[0] || '');
        setSearchedColumn(dataIndex);

        setApiSearchQuery((prev) => {
            const next = { ...prev };
            if (dataIndex === 'id') {
                delete next.id;
                delete next.ticket_number;
                if (queryValue && selectedKeys[0]) {
                    next[getTicketIdentifierSearchKey(selectedKeys[0])] = selectedKeys[0];
                }
            } else if (queryValue) {
                (next as any)[dataIndex] = queryValue;
            } else {
                delete (next as any)[dataIndex];
            }
            return next;
        });

        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleReset = (clearFilters: () => void, dataIndex: SearchableDataIndex) => {
        clearFilters();
        setSearchText('');
        setApiSearchQuery((prev) => {
            const newState = { ...prev };
            if (dataIndex === 'id') {
                delete newState.id;
                delete newState.ticket_number;
            } else {
                delete (newState as any)[dataIndex];
            }
            return newState;
        });
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const renderHighlightedText = (text: string, dataIndex: SearchableDataIndex) =>
        searchedColumn === dataIndex && searchText ? (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        ) : (
            text
        );

    const getColumnSearchProps = (dataIndex: SearchableDataIndex, titleKey: string): TableColumnType<Ticket> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`${t('common.search')} ${t(titleKey)}`}
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
                        {t('common.search')}
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        {t('common.reset')}
                    </Button>
                    <Button type="link" size="small" onClick={() => close()}>
                        {t('common.close')}
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: () => {
            const isFilteredByApi =
                dataIndex === 'id'
                    ? !!apiSearchQuery.id || !!apiSearchQuery.ticket_number
                    : !!(apiSearchQuery as any)[dataIndex];
            return <SearchOutlined style={{ color: isFilteredByApi ? '#1677ff' : undefined }} />;
        },
    });

    const getColumnSelectProps = (
        dataIndex: SearchableDataIndex,
        titleKey: string,
        options: { label: React.ReactNode; value: string | number; textLabel?: string }[],
    ): TableColumnType<Ticket> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Select
                    mode="multiple"
                    allowClear
                    showArrow
                    style={{ width: 250, marginBottom: 8 }}
                    placeholder={`${t('common.select')} ${t(titleKey)}`}
                    value={selectedKeys}
                    onChange={(value) => setSelectedKeys(value)}
                    options={options}
                    maxTagCount="responsive"
                    listHeight={250}
                    dropdownStyle={{ minWidth: 200 }}
                    filterOption={(input, option: any) => {
                        const textToSearch = option?.textLabel ?? (typeof option?.label === 'string' ? option?.label : '');
                        return textToSearch.toString().toLowerCase().includes(input.toLowerCase());
                    }}
                />
                <Flex gap="small">
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        size="small"
                        style={{ flex: 1 }}
                    >
                        {t('common.filter')}
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ flex: 1 }}
                    >
                        {t('common.reset')}
                    </Button>
                </Flex>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <FilterOutlined
                style={{ color: filtered || (apiSearchQuery as any)[dataIndex] ? '#1677ff' : undefined }}
            />
        ),
    });

    const getColumnTreeProps = (
        dataIndex: SearchableDataIndex,
        titleKey: string,
        treeData: any[],
    ): TableColumnType<Ticket> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <TreeSelect
                    style={{ width: 250, marginBottom: 8 }}
                    dropdownClassName="tree-select-no-scroll"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto', maxWidth: 250 }}
                    placeholder={`${t('common.select')} ${t(titleKey)}`}
                    treeData={treeData}
                    treeNodeFilterProp="title"
                    value={selectedKeys}
                    onChange={(value) => setSelectedKeys(value)}
                    treeDefaultExpandAll={false}
                    showSearch
                    allowClear
                    multiple
                    treeCheckable
                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                    treeExpandAction="click"
                />
                <Flex gap="small">
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        size="small"
                        style={{ flex: 1 }}
                    >
                        {t('common.filter')}
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ flex: 1 }}
                    >
                        {t('common.reset')}
                    </Button>
                </Flex>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <FilterOutlined
                style={{ color: filtered || (apiSearchQuery as any)[dataIndex] ? '#1677ff' : undefined }}
            />
        ),
    });

    const columns: ColumnsType<Ticket> = [
        {
            title: t('tickets.ticket_number'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            ellipsis: true,
            fixed: 'left',
            ...getColumnSearchProps('id' as any, 'tickets.ticket_number'),
            render: (id: string, record: Ticket) => {
                const displayValue = record.ticket_number || id;
                return (
                    <Popover
                        title={t('tickets.ticket_number')}
                        content={<div style={{ maxWidth: 400, fontFamily: 'monospace' }}>{displayValue}</div>}
                        trigger="hover"
                        placement="topLeft"
                    >
                        <EllipsisComponent
                            content={renderHighlightedText(displayValue, 'id')}
                            copyable
                        />
                    </Popover>
                );
            },
        },
        {
            title: t('tickets.title'),
            dataIndex: 'title',
            key: 'title',
            width: 450,
            ellipsis: true,
            render: (text: string, record: Ticket) => (
                <Popover
                    title={t('tickets.title')}
                    content={<div style={{ maxWidth: 400 }}>{text}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <div
                        onClick={() => handleView(record.id)}
                        style={{
                            cursor: 'pointer',
                            color: 'var(--color-primary, #1677ff)',
                            display: 'block',
                            width: '100%',
                        }}
                    >
                        <EllipsisComponent content={renderHighlightedText(text, 'title')} />
                    </div>
                </Popover>
            ),
            ...getColumnSearchProps('title', 'tickets.title'),
        },
        {
            title: t('tickets.status'),
            dataIndex: 'status',
            key: 'status',
            width: 140,
            ellipsis: true,
            render: (status: string) => {
                const statusKey = status.toLowerCase().replace(/\s+/g, '_');
                const translatedStatus = t(`status.${statusKey}`, { defaultValue: status });
                return <span>{renderHighlightedText(translatedStatus, 'status')}</span>;
            },
            ...getColumnSelectProps('status', 'tickets.status', [
                { label: t('status.open'), value: 'open' },
                { label: t('status.re_open'), value: 're_open' },
                { label: t('status.in_progress'), value: 'in_progress' },
                { label: t('status.pending'), value: 'pending' },
                { label: t('status.out_of_service'), value: 'out_of_service' },
                { label: t('status.closed'), value: 'closed' },
            ]),
        },
        {
            title: t('tickets.priority'),
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            ellipsis: true,
            render: (priority: string) => {
                const translatedPriority = t(`priority.${priority}`, { defaultValue: priority });
                return <span>{renderHighlightedText(translatedPriority, 'priority')}</span>;
            },
            ...getColumnSelectProps('priority', 'tickets.priority', [
                { label: t('priority.important/urgent'), value: 'important/urgent' },
                { label: t('priority.important'), value: 'important' },
                { label: t('priority.urgent'), value: 'urgent' },
                { label: t('priority.NA'), value: 'NA' },
            ]),
        },
        {
            title: t('tickets.assignee'),
            dataIndex: 'assignee',
            key: 'assignee',
            width: 160,
            ellipsis: true,
            render: (assignees: any[], record: any) => {

                return <AssigneeColumnCell record={record} assignees={assignees} />;
            },
            ...getColumnSelectProps('assignee', 'tickets.assignee', assignees),
        },
        {
            title: t('tickets.specialization'),
            dataIndex: 'specialization',
            key: 'specialization',
            width: 100,
            ellipsis: true,
            render: (specialization: Specialization | null) => {
                const text = specialization?.name ?? t('tickets.noSpecialization');
                return (
                    <Popover title={t('tickets.specialization')} content={<div style={{ maxWidth: 300 }}>{text}</div>} trigger="hover" placement="topLeft">
                        <div style={{ width: '100%' }}>
                            <EllipsisComponent content={renderHighlightedText(text, 'specialization')} />
                        </div>
                    </Popover>
                );
            },
            ...getColumnSelectProps(
                'specialization',
                'tickets.specialization',
                (Array.isArray(specs) ? specs : []).map((s: any) => ({ label: s.name, value: s.id })),
            ),
        },
        {
            title: t('tickets.problemType'),
            dataIndex: 'problem',
            key: 'problem',
            width: 180,
            ellipsis: true,
            render: (problem: Problem | null) => {
                const text = problem?.name ?? t('tickets.noType');
                return (
                    <Popover title={t('tickets.problemType')} content={<div style={{ maxWidth: 300 }}>{text}</div>} trigger="hover" placement="topLeft">
                        <div style={{ width: '100%' }}>
                            <EllipsisComponent content={renderHighlightedText(text, 'problem')} />
                        </div>
                    </Popover>
                );
            },
            ...getColumnTreeProps('problem', 'tickets.problemType', problemTreeData),
        },
        ...(!isRequester
            ? [
                {
                    title: t('tickets.requester'),
                    dataIndex: ['requester', 'name'],
                    key: 'requesterName',
                    width: 180,
                    ellipsis: true,
                    render: (requesterName: string) => (
                        <Popover
                            title={t('tickets.requester')}
                            content={
                                <div style={{ maxWidth: 300 }}>
                                    {requesterName || t('common.empty')}
                                </div>
                            }
                            trigger="hover"
                            placement="topLeft"
                        >
                            <EllipsisComponent content={requesterName || t('common.empty')} />
                        </Popover>
                    ),
                    ...getColumnSelectProps('requester', 'tickets.requester', requesters),
                },
                {
                    title: t('user_list.university'),
                    dataIndex: ['requester', 'university', 'name'],
                    key: 'requesterUniversity',
                    width: 180,
                    ellipsis: true,
                    render: (_: string, record: Ticket) => {
                        const text = record.requester?.university?.name || t('common.empty');
                        return (
                            <Popover title={t('user_list.university')} content={<div style={{ maxWidth: 300 }}>{text}</div>} trigger="hover" placement="topLeft">
                                <div style={{ width: '100%' }}>
                                    <EllipsisComponent content={text} />
                                </div>
                            </Popover>
                        );
                    },
                    ...getColumnSelectProps('university', 'university', universities),
                },
                {
                    title: t('user_list.domain'),
                    dataIndex: ['requester', 'domain', 'name'],
                    key: 'requesterDomain',
                    width: 180,
                    ellipsis: true,
                    render: (_: string, record: Ticket) => {
                        const text = record.requester?.domain?.name || t('common.empty');
                        return (
                            <Popover title={t('user_list.domain')} content={<div style={{ maxWidth: 300 }}>{text}</div>} trigger="hover" placement="topLeft">
                                <div style={{ width: '100%' }}>
                                    <EllipsisComponent content={text} />
                                </div>
                            </Popover>
                        );
                    },
                    ...getColumnSelectProps('domain', 'domain', domains),
                },
                {
                    title: t('user_list.department'),
                    dataIndex: ['requester', 'departments'],
                    key: 'requesterDepartments',
                    width: 220,
                    ellipsis: true,
                    render: (_: unknown, record: Ticket) => {
                        const text = record.requester?.departments?.map((department) => department.name).join(', ') || t('common.empty');
                        return (
                            <Popover title={t('user_list.department')} content={<div style={{ maxWidth: 300 }}>{text}</div>} trigger="hover" placement="topLeft">
                                <div style={{ width: '100%' }}>
                                    <EllipsisComponent content={text} />
                                </div>
                            </Popover>
                        );
                    },
                    ...getColumnSelectProps('department', 'department', departments),
                },
            ]
            : []),
    ];

    return { columns };
};
