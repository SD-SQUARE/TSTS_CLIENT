/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useRef, useState } from 'react';
import { Resizable } from 'react-resizable';
import { Table, Tag, Typography, Spin, Alert, Pagination, Space, Button, Flex, Popover, type InputRef, Input, type TableColumnType, Select, TreeSelect, Tooltip, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilterOutlined, HolderOutlined, PlusOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Problem, Specialization, Ticket } from '../Types/tickets';
import { useTickets } from '../Hooks/useTicket';
import { useNavigate, useParams } from 'react-router-dom';
import EllipsisComponent from '../../../components/EllipsisComponent';
import Highlighter from 'react-highlight-words';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useSpecializations, useTicketProblems } from '../Hooks/useTicketForm';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DOMPurify from "dompurify";

type SearchableDataIndex = `id` | `title` | `problem` | `specialization` | `status` | 'priority' | 'description';

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
                <Tooltip
                    title={spec.name}
                    mouseEnterDelay={0.1}
                    placement="top"
                >
                    <span title={spec.name} style={{ display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {spec.name}
                    </span>
                </Tooltip>
            ),
            label: spec.name,
            value: `spec-${spec.id}`,
            key: spec.id,
            selectable: false,
            children: hasProblems
                ? spec.problems.map((prob: any) => ({
                    title: (
                        <Tooltip
                            title={prob.name}
                            mouseEnterDelay={0.1}
                            placement="top"
                        >
                            <span title={prob.name} style={{ display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {prob.name}
                            </span>
                        </Tooltip>
                    ),
                    label: prob.name,
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
                // <div
                //     // TODO: use quilljs here
                //     dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text || '') }}
                // />
            
        );
    };

    const getColumnTreeProps = (dataIndex: SearchableDataIndex, titleKey: string, treeData: any[]): TableColumnType<Ticket> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <TreeSelect
                    style={{ width: 250, marginBottom: 8 }}
                    dropdownClassName="tree-select-no-scroll"
                    dropdownStyle={{ maxHeight: 400, overflow: 'hidden', maxWidth: 250 }}
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
            width: 150,
            fixed: 'left',
            ...getColumnSearchProps('id' as any, 'tickets.id'), 
            render: (id: string) => (
                <Popover
                    title={t('tickets.id')}
                    content={<div style={{ maxWidth: 400, fontFamily: 'monospace' }}>{id}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent content={renderHighlightedText(id, 'id')} copyable />
                </Popover>
            ),      },
            
            
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
            width: 500,
            render: (text: string) => (
                <Popover
                    title={t('tickets.description')} 
                    content={<div style={{ maxWidth: 500 }}>{text}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent  content={renderHighlightedText(text, 'description')} />
                    {/* <EllipsisComponent percentage={4} isDescription={true} content={renderHighlightedText(text, 'description')} /> */}

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



    const columnOptions = columns.map(col => ({
        label: col.title as string,
        value: col.key as string,
    }));

    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        columns.map(col => col.key as string)
    );

    const [columnOrder, setColumnOrder] = useState<string[]>(
        columns.map(col => col.key as string)
    );

    const SortableItem = ({ id, label, isChecked, onCheck }: any) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            background: isDragging ? '#fafafa' : 'transparent',
            zIndex: isDragging ? 1000 : 1,
            borderRadius: '4px',
            border: isDragging ? '1px solid #91caff' : '1px solid transparent',
        };

        return (
            <div ref={setNodeRef} style={style}>
                <HolderOutlined {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8, color: '#bfbfbf' }} />
                <Checkbox checked={isChecked} onChange={() => onCheck(id)}>
                    {label}
                </Checkbox>
            </div>
        );
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const onDragEnd = ({ active, over }: any) => {
        if (active.id !== over?.id) {
            setColumnOrder((prev) => {
                const activeIndex = prev.indexOf(active.id);
                const overIndex = prev.indexOf(over.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const controlPanel = (
        <div style={{ padding: '8px', width: '220px' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                    <Flex vertical gap="small">
                        {columnOrder.map((key) => {
                            const col = columns.find(c => c.key === key);
                            return (
                                <SortableItem
                                    key={key}
                                    id={key}
                                    label={col?.title as string}
                                    isChecked={visibleColumns.includes(key)}
                                    onCheck={(id: string) => {
                                        setVisibleColumns(prev =>
                                            prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
                                        );
                                    }}
                                />
                            );
                        })}
                    </Flex>
                </SortableContext>
            </DndContext>
        </div>
    );

    const filteredColumns = columns.filter(col => visibleColumns.includes(col.key as string));

    const ResizableTitle = (props: any) => {
        const { onResize, width, ...restProps } = props;
        const [localWidth, setLocalWidth] = useState(width);

        useEffect(() => {
            setLocalWidth(width);
        }, [width]);
        if (!width) return <th {...restProps} />;
        return (
            <Resizable
                width={localWidth}
                height={0}
                handle={<span className="react-resizable-handle" onClick={(e) => e.stopPropagation()} />}
                onResize={(_, { size }) => {
                    setLocalWidth(size.width);
                }}
                onResizeStop={onResize}
                draggableOpts={{ enableUserSelectHack: false }}
            >
                <th {...restProps} style={{ ...restProps.style, width: localWidth }} />
            </Resizable>
        );
    };


    const [colWidths, setColWidths] = useState<{ [key: string]: number }>({
        id: 150, status: 140, priority: 120, title: 250, description: 500, specialization: 180, problem: 180, requesterName: 180, assignee: 300
    });

    const handleResize = (key: string) => (e: any, { size }: any) => {
        setColWidths(prev => ({ ...prev, [key]: size.width }));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const finalColumns = React.useMemo(() => {
        
        return columnOrder
        .map(key => columns.find(c => c.key === key)) 
        .filter(col => col && visibleColumns.includes(col.key as string)) 
        .map(col => ({
            ...col,
            width: colWidths[col!.key as string] || col!.width,
            onHeaderCell: (column: any) => ({
                width: column.width,
                onResize: handleResize(column.key as string),
            }),
        }));
    }, [columnOrder, colWidths, visibleColumns]);




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
            <style>
                {`
                .tree-select-no-scroll .ant-select-tree-list-holder-inner {
                    width: 100% !important;
                }
                .tree-select-no-scroll .ant-select-tree-node-content-wrapper {
                    flex: 1 !important;
                    overflow: hidden !important;
                    display: flex !important;
                }
                .tree-select-no-scroll .ant-select-tree-title {
                    flex: 1 !important;
                    overflow: hidden !important;
                }
                .react-resizable {
                    position: relative;
                    background-clip: padding-box;
                }
                .react-resizable-handle {
                    position: absolute;
                    right: -10px !important;
                    bottom: 0;
                    z-index: 10;
                    width: 20px !important;
                    height: 100%;
                    cursor: col-resize;
                }
                
                `}
            </style>


            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Typography.Title level={2} style={{ margin: 0 }}>{t('tickets.listTitle')}</Typography.Title>

                <Space>
                    <Popover content={controlPanel} title={t('common.showHideColumns')} trigger="click">
                        <Button icon={<SettingOutlined />}>{t('common.columns')}</Button>
                    </Popover>
                    {isRequester && <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('tickets.new_ticket')}</Button>}
                </Space>
            </Flex>

            <Table
                components={{ header: { cell: ResizableTitle } }}
                columns={finalColumns}
                dataSource={data?.data || []}
                rowKey="id"
                loading={isLoading}
                tableLayout='fixed'
                scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
                pagination={false}
                onRow={handleRowClick}
            />
        </div>
    );
};

export default TicketList;