/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
    Table, Typography, Spin, Alert, Pagination, Space, Button, Flex, Popover, Tooltip, Tag,
} from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import arEG from 'antd/lib/locale/ar_EG';

import { useTickets, type TicketSearchQuery } from '../Hooks/useTicket';
import { useSpecializations, useTicketProblems } from '../Hooks/useTicketForm';
import { useRowHighlighting } from '../Hooks/useRowHighlighting';
import { useTicketColumns } from '../Hooks/useTicketColumns';
import { useColumnSettings } from '../Hooks/useColumnSettings';
import ColumnControlPanel from './ticketListComponents/ColumnControlPanel';
import TicketListStyles from './ticketListComponents/TicketListStyles';
import ResizableTitle from './ticketListComponents/ResizableHeader';


const TicketList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const navigate = useNavigate();
    const { role } = useParams();

    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });
    const [apiSearchQuery, setApiSearchQuery] = useState<TicketSearchQuery>({});

    const { data, isLoading, isError, error } = useTickets(
        pagination.page,
        pagination.pageSize,
        apiSearchQuery,
    );
    const { data: specs } = useSpecializations();
    const { data: hierarchicalProblems } = useTicketProblems();

    const antdLocale = currentLanguage === 'ar' ? arEG : enUS;

    // ─── Row highlighting ────────────────────────────────────────────────────
    const {
        showRowColors, setShowRowColors,
        highlightedStatuses, setHighlightedStatuses,
        getRowClassName,
    } = useRowHighlighting();

    // ─── Problem tree data ───────────────────────────────────────────────────
    const problemTreeData = useMemo(
        () =>
            hierarchicalProblems?.specializations?.map((spec: any) => ({
                title: (
                    <Tooltip title={spec.name} mouseEnterDelay={0.1} placement="top">
                        <span
                            title={spec.name}
                            style={{
                                display: 'block', width: '100%',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                        >
                            {spec.name}
                        </span>
                    </Tooltip>
                ),
                label: spec.name,
                value: `spec-${spec.id}`,
                key: spec.id,
                selectable: false,
                children:
                    spec.problems?.length > 0
                        ? spec.problems.map((prob: any) => ({
                              title: (
                                  <Tooltip title={prob.name} mouseEnterDelay={0.1} placement="top">
                                      <span
                                          title={prob.name}
                                          style={{
                                              display: 'block', width: '100%',
                                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                          }}
                                      >
                                          {prob.name}
                                      </span>
                                  </Tooltip>
                              ),
                              label: prob.name,
                              value: prob.id,
                              key: prob.id,
                              isLeaf: true,
                          }))
                        : [
                              {
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
                              },
                          ],
            })) || [],
        [hierarchicalProblems, t],
    );

    // ─── Column definitions ──────────────────────────────────────────────────
    const { columns } = useTicketColumns({
        role,
        specs: Array.isArray(specs) ? specs : [],
        problemTreeData,
        apiSearchQuery,
        setApiSearchQuery,
        setPagination,
        handleView: (id: string) => navigate(`/${role}/tickets/${id}`),
    });

    const defaultColumnKeys = columns.map((col) => col.key as string);

    // ─── Column settings (visibility, order, widths) ─────────────────────────
    const {
        visibleColumns, setVisibleColumns,
        columnOrder,
        colWidths,
        handleResize,
        onDragEnd,
        resetSettings,
    } = useColumnSettings({ defaultColumnKeys });

    // ─── DnD sensors ────────────────────────────────────────────────────────
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // ─── Final columns (ordered, filtered, resizable) ────────────────────────
    const finalColumns = useMemo(
        () =>
            columnOrder
                .map((key) => columns.find((c) => c.key === key))
                .filter((col) => col && visibleColumns.includes(col.key as string))
                .map((col) => ({
                    ...col,
                    width: colWidths[col!.key as string] || col!.width,
                    minWidth: 100,
                    onHeaderCell: (column: any) => ({
                        width: column.width,
                        onResize: handleResize(column.key as string),
                    }),
                })),
        [columnOrder, colWidths, visibleColumns, i18n.language, columns, handleResize],
    );

    // ─── Render ──────────────────────────────────────────────────────────────
    if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

    if (isError)
        return (
            <Alert
                message={t('errors.fetchFailed')}
                description={error instanceof Error ? error.message : t('errors.unknown')}
                type="error"
                showIcon
            />
        );

    const controlPanel = (
        <ColumnControlPanel
            columns={columns}
            columnOrder={columnOrder}
            visibleColumns={visibleColumns}
            showRowColors={showRowColors}
            highlightedStatuses={highlightedStatuses}
            sensors={sensors}
            onDragEnd={onDragEnd}
            onVisibilityChange={(id) =>
                setVisibleColumns((prev) =>
                    prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
                )
            }
            onShowRowColorsChange={setShowRowColors}
            onHighlightedStatusesChange={setHighlightedStatuses}
            onReset={() => resetSettings(defaultColumnKeys)}
        />
    );

    return (
        <div style={{ padding: '24px' }}>
            <TicketListStyles />

            <Typography.Title level={2} style={{ margin: 0, marginBottom: 16 }}>
                {t('tickets.listTitle')}
            </Typography.Title>

            <ConfigProvider locale={antdLocale} direction={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Pagination
                        current={pagination.page}
                        pageSize={pagination.pageSize}
                        total={data?.total || 0}
                        onChange={(page, pageSize) => setPagination({ page, pageSize })}
                        showSizeChanger
                    />
                    <Space>
                        <Popover content={controlPanel} trigger="click">
                            <Button icon={<SettingOutlined />}>{t('common.columns')}</Button>
                        </Popover>
                        {role === 'requester' && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/requester/tickets/new-ticket')}
                            >
                                {t('tickets.new_ticket')}
                            </Button>
                        )}
                    </Space>
                </Flex>

                <Table
                    components={{ header: { cell: ResizableTitle } }}
                    columns={finalColumns}
                    dataSource={data?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    tableLayout="auto"
                    rowClassName={(record) => getRowClassName(record.status)}
                    scroll={{
                        x: 'max-content',
                        y: data?.data?.length > 0 ? 'calc(100vh - 280px)' : 'auto',
                    }}
                    pagination={false}
                />
            </ConfigProvider>
        </div>
    );
};

export default TicketList;
