/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useRef, useState } from 'react';
import { Table, Tag, Typography, Spin, Alert, Pagination, Space, Button, Flex, Popover, type InputRef, Input, type TableColumnType, Select, TreeSelect } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Problem, Specialization, Ticket } from '../Types/tickets';
import { useTickets } from '../Hooks/useTicket';
import { useNavigate, useParams } from 'react-router-dom';
import EllipsisComponent from '../../../components/EllipsisComponent';
import Highlighter from 'react-highlight-words';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useSpecializations, useTicketProblems } from '../Hooks/useTicketForm';

type SearchableDataIndex = `title` | `problem` | `specialization` | `status` | 'priority' | 'description';

const TicketList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { role } = useParams();
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });

    const openstate = "Open"
    const reopenstate = "Re Open"
    const closestate = "Closed"
    const in_progress_state = "In Progress"
    const pending_state = "Pending"
    const out_of_service_state = "Out of Service"
    const resolved_status = "Resolved"

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState<SearchableDataIndex | ''>('');
    const searchInput = useRef<InputRef>(null);
    const { data: specs } = useSpecializations();
    const { data: hierarchicalProblems } = useTicketProblems();

    const [apiSearchQuery, setApiSearchQuery] = useState<{ [key: string]: string }>({});

    const { data, isLoading, isError, error } = useTickets(pagination.page, pagination.pageSize, apiSearchQuery);


    const isRequester = role === 'requester';

    const problemTreeData = hierarchicalProblems?.specializations?.map((spec: any) => {
        const hasProblems = spec.problems && spec.problems.length > 0;

        return {
            title: (
                <span title={spec.name} style={{ display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {spec.name}
                </span>
            ),
            value: `spec-${spec.id}`,
            key: spec.id,
            selectable: false,
            children: hasProblems
                ? spec.problems.map((prob: any) => ({
                    title: (
                        <span title={prob.name} style={{ display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prob.name}
                        </span>
                    ),
                    value: prob.id,
                    key: prob.id,
                    isLeaf: true,
                }))
                : [{
                    title: (
                        <div style={{ paddingLeft: '4px' }}>
                            <Tag style={{ fontSize: '10px', margin: 0 }}>
                                {t('common.empty')}
                            </Tag>
                        </div>
                    ),
                    value: `empty-${spec.id}`,
                    key: `empty-${spec.id}`,
                    disabled: true,
                    isLeaf: true,
                }]
        };
    }) || [];

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ page, pageSize });
    };

    const handleAdd = () => {
        navigate(`/requester/tickets/new-ticket`);
    };

    const handleView = (id: string) => {
        navigate(`/${role}/tickets/${id}`);
    };

    const handleRowClick = (record: Ticket) => {
        return {
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                const target = event.target as HTMLElement;
                const isInteractive = target.closest('button, a, .ant-popconfirm, .ant-dropdown, .ant-tag, .ant-typography-copy');
                if (!isInteractive) {
                    handleView(record.id);
                }
            },
            style: { cursor: 'pointer' },
        };
    };

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


    const renderHighlightedText = (text: string, dataIndex: SearchableDataIndex) => {
        return searchedColumn === dataIndex && searchText ? (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        ) : (
            text
        );
    };

    const getColumnTreeProps = (dataIndex: SearchableDataIndex, titleKey: string, treeData: any[]): TableColumnType<Ticket> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <TreeSelect
                    style={{ width: 250, marginBottom: 8 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'hidden', maxWidth: 300 }}
                    placeholder={`${t('common.select')} ${t(titleKey)}`}
                    treeData={treeData}
                    treeNodeFilterProp="title"
                    value={selectedKeys[0]}
                    onChange={(value) => setSelectedKeys(value ? [value] : [])}
                    treeDefaultExpandAll={false}
                    showSearch
                    allowClear
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
            <FilterOutlined style={{ color: filtered || apiSearchQuery[dataIndex] ? '#1677ff' : undefined }} />
        ),
    });

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
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        {t('common.close')}
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => {
            const isFilteredByApi = !!apiSearchQuery[dataIndex];
            return <SearchOutlined style={{ color: isFilteredByApi ? '#1677ff' : undefined }} />
        },
    });

    const getColumnSelectProps = (
        dataIndex: SearchableDataIndex,
        titleKey: string,
        options: { label: string, value: string | number }[]
    ): TableColumnType<Ticket> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Select
                    style={{ width: 200, marginBottom: 8 }}
                    placeholder={`${t('common.select')} ${t(titleKey)}`}
                    value={selectedKeys[0]}
                    onChange={(value) => setSelectedKeys(value ? [value] : [])}
                    options={options}
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
            <FilterOutlined style={{ color: filtered || apiSearchQuery[dataIndex] ? '#1677ff' : undefined }} />
        ),
    });

    const columns: ColumnsType<Ticket> = [
        {
            title: "#",
            dataIndex: 'id',
            key: 'id',
            width: 60,
            fixed: 'left',
            render: (_, __, index) => (pagination.page - 1) * pagination.pageSize + index + 1,
        },
        {
            title: t('tickets.status'),
            dataIndex: 'status',
            key: 'status',
            width: 140,
            ellipsis: true,
            render: (status: string) => {

                switch (status) {
                    case openstate:
                        status = openstate;
                        break;
                    case reopenstate:
                        status = reopenstate;
                        break;
                    case closestate:
                        status = closestate;
                        break;
                    case in_progress_state:
                        status = in_progress_state;
                        break;
                    case pending_state:
                        status = pending_state;
                        break;
                    case out_of_service_state:
                        status = out_of_service_state;
                        break;
                    case resolved_status:
                        status = resolved_status;
                        break;
                    default:
                        status = openstate;
                }
                return (
                    <Tag variant='outlined' color={status === openstate || status === reopenstate ? 'green' : status === in_progress_state ? 'blue' : status === closestate ? 'red' : status === pending_state ? 'gold' : status === out_of_service_state ? 'volcano' : status === resolved_status ? 'lime' : 'geekblue'}>
                        {renderHighlightedText(status, 'status')}
                    </Tag>
                )
            },
            ...getColumnSelectProps('status', 'tickets.status', [
                { label: t('status.open'), value: 'open' },
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
            render: (priority: string) => (
                <Tag variant='outlined' color={priority === 'important/urgent' ? 'volcano' : priority === 'important' ? 'orange' : priority === 'urgent' ? 'red' : 'geekblue'}>
                    {renderHighlightedText(priority, 'priority')}
                </Tag>
            ),
            ...getColumnSelectProps('priority', 'tickets.priority', [
                { label: t('priority.important/urgent'), value: 'important/urgent' },
                { label: t('priority.important'), value: 'important' },
                { label: t('priority.urgent'), value: 'urgent' },
                { label: t('priority.NA'), value: 'NA' },
            ]),
        },
        {
            title: t('tickets.title'),
            dataIndex: 'title',
            key: 'title',
            width: 250,
            render: (text: string) => (
                <Popover
                    title={t('translation.title_ar')}
                    content={<div style={{ maxWidth: 400 }}>{text}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent content={renderHighlightedText(text, 'title')} />
                </Popover>
            ),
            ...getColumnSearchProps('title', 'tickets.title'),
        },
        {
            title: t('tickets.description'),
            dataIndex: 'description',
            key: 'description',
            width: 400,
            render: (text: string) => (
                <Popover
                    title={t('translation.description_ar')}
                    content={<div style={{ maxWidth: 400 }}>{text}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent content={renderHighlightedText(text, 'description')} />
                </Popover>
            ),
            ...getColumnSearchProps('description', 'tickets.description'),
        },
        {
            title: t('tickets.specialization'),
            dataIndex: 'specialization',
            key: 'specialization',
            width: 180,
            ellipsis: true,
            render: (specialization: Specialization | null) => (
                <Tag color={specialization?.name ? 'blue' : 'red'} variant="outlined">
                    {renderHighlightedText(specialization?.name ?? t('tickets.noSpecialization'), 'specialization')}
                </Tag>
            ),
            ...getColumnSelectProps('specialization', 'tickets.specialization',
                (Array.isArray(specs) ? specs : []).map((s: any) => ({
                    label: s.name,
                    value: s.id,
                }))
            ),
        },
        {
            title: t('tickets.problemType'),
            dataIndex: 'problem',
            key: 'problem',
            width: 180,
            ellipsis: true,
            render: (problem: Problem | null) => (
                <Tag color={problem?.name ? 'blue' : 'red'} variant="outlined">
                    {renderHighlightedText(problem?.name ?? t('tickets.noType'), 'problem')}
                </Tag>
            ),
            ...getColumnTreeProps('problem', 'tickets.problemType', problemTreeData),
        },
        {
            title: t('tickets.requester'),
            dataIndex: ['requester', 'name'],
            key: 'requesterName',
            width: 180,
        },
        {
            title: t('tickets.assignee'),
            dataIndex: 'assignee',
            key: 'assignee',
            width: 300,

            render: (assignees: any[]) => {
                if (!assignees || assignees.length === 0) {
                    return <Typography.Text type="secondary" italic>{t('tickets.unassigned')}</Typography.Text>;
                }

                const tagElements = assignees.map((a) => (
                    <Tag
                        key={a.id}
                        color="cyan"
                        style={{ display: 'inline-block', margin: '2px' }}
                    >
                        {a.name || `${a.first_name} ${a.last_name}`}
                    </Tag>
                ));

                return (
                    <Popover
                        title={t('tickets.assignee')}
                        content={<div style={{ maxWidth: 300 }}>{tagElements}</div>}
                        trigger="hover"
                        placement="topLeft"
                    >
                        <div className="assignee-ellipsis-wrapper">
                            <EllipsisComponent content={tagElements} />
                        </div>
                    </Popover>
                );
            }
        },
    ];

    if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

    if (isError) return (
        <Alert
            message={t('errors.fetchFailed')}
            description={error instanceof Error ? error.message : t('errors.unknown')}
            type="error"
            showIcon
        />
    );

    return (
        <div style={{ padding: '24px' }}>
            <Typography.Title level={2} style={{ marginBottom: 16 }}>
                {t('tickets.listTitle')}
            </Typography.Title>

            <Flex justify="space-between" align="center" wrap="wrap" gap="middle" style={{ marginBottom: 24 }}>
                <Pagination
                    current={pagination.page}
                    pageSize={pagination.pageSize}
                    total={data?.total || 0}
                    onChange={handleTableChange}
                    showSizeChanger
                />
                {isRequester &&
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
                        {t('tickets.new_ticket')}
                    </Button>
                }
            </Flex>

            <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                loading={isLoading}
                scroll={{ x: 1600 }}
                pagination={false}
                onRow={handleRowClick}
            />
        </div>
    );
};

export default TicketList;