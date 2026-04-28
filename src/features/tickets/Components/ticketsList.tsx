/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
    Typography, Alert, Pagination, Space, Button, Flex, Popover, Tooltip, Tag,
} from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import arEG from 'antd/lib/locale/ar_EG';

import AppTable from '../../../components/AppTable';
import {
    useRequestersLookup,
    useTicketDepartmentsLookup,
    useTicketDomainsLookup,
    useTicketUniversitiesLookup,
    useTickets,
    type TicketSearchQuery,
} from '../Hooks/useTicket';
import { useSpecializations, useTechnicians, useAdmins, useTicketProblems } from '../Hooks/useTicketForm';
import { useRowHighlighting } from '../Hooks/useRowHighlighting';
import { useTicketColumns } from '../Hooks/useTicketColumns';
import { useColumnSettings } from '../Hooks/useColumnSettings';
import ColumnControlPanel from './ticketListComponents/ColumnControlPanel';
import TicketListStyles from './ticketListComponents/TicketListStyles';
import ResizableTitle from './ticketListComponents/ResizableHeader';


const TicketList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const isArabic = currentLanguage.startsWith('ar');
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
    const { data: technicians } = useTechnicians();
    const { data: admins } = useAdmins();
    const { data: requesters } = useRequestersLookup(role !== 'requester');
    const { data: universities } = useTicketUniversitiesLookup();
    const { data: domains } = useTicketDomainsLookup();
    const { data: departments } = useTicketDepartmentsLookup();

    const possibleAssignees = useMemo(() => {
        const safeTechs = Array.isArray(technicians) ? technicians : [];
        const safeAdmins = Array.isArray(admins) ? admins : [];
        const techList = safeTechs.map((t: any) => ({ ...t, _userType: 'tech' }));
        const adminList = safeAdmins.map((a: any) => ({ ...a, _userType: 'admin' }));
        const combined = [...techList, ...adminList];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
    }, [technicians, admins]);

    const antdLocale = currentLanguage === 'ar' ? arEG : enUS;

    const localizedUserLabel = (item: any) => {
        const nestedName = typeof item?.name === 'object'
            ? (isArabic ? item.name?.ar : item.name?.en)
            : undefined;

        return (
            (isArabic
                ? item?.name_ar || item?.name_en || nestedName
                : item?.name_en || item?.name_ar || nestedName) ||
            (typeof item?.name === 'string' ? item.name : item?.email) ||
            ''
        );
    };

    const localizedLookupLabel = (item: any) => {
        const nestedName = typeof item?.name === 'object'
            ? (isArabic ? item.name?.ar : item.name?.en)
            : undefined;

        return (
            (isArabic
                ? item?.name_ar || item?.name_en || nestedName
                : item?.name_en || item?.name_ar || nestedName) ||
            (typeof item?.name === 'string' ? item.name : '') ||
            ''
        );
    };

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
                    <Tooltip title={localizedLookupLabel(spec)} mouseEnterDelay={0.1} placement="top">
                        <span
                            title={localizedLookupLabel(spec)}
                            style={{
                                display: 'block', width: '100%',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                        >
                            {localizedLookupLabel(spec)}
                        </span>
                    </Tooltip>
                ),
                label: localizedLookupLabel(spec),
                value: `spec-${spec.id}`,
                key: spec.id,
                selectable: false,
                children:
                    spec.problems?.length > 0
                        ? spec.problems.map((prob: any) => ({
                              title: (
                                  <Tooltip title={localizedLookupLabel(prob)} mouseEnterDelay={0.1} placement="top">
                                      <span
                                          title={localizedLookupLabel(prob)}
                                          style={{
                                              display: 'block', width: '100%',
                                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                          }}
                                      >
                                          {localizedLookupLabel(prob)}
                                      </span>
                                  </Tooltip>
                              ),
                              label: localizedLookupLabel(prob),
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
        requesters: (requesters || []).map((item) => ({
            value: item.id,
            label: localizedUserLabel(item),
        })),
        assignees: possibleAssignees.map((item: any) => {
            const userLabel = localizedUserLabel(item);
            return {
                value: item.id,
                label: (
                    <Flex justify="space-between" align="center">
                        <Typography.Text ellipsis style={{ maxWidth: 140 }}>
                            {userLabel}
                        </Typography.Text>
                        <Tag
                            color={item._userType === 'admin' ? 'purple' : 'blue'}
                            style={{ marginInlineEnd: 0 }}
                        >
                            {item._userType === 'admin' ? t('roles.admin', 'Admin') : t('roles.technician', 'Tech')}
                        </Tag>
                    </Flex>
                ),
                textLabel: userLabel,
            };
        }),
        universities: (universities || []).map((item: any) => ({
            value: item.id,
            label: localizedLookupLabel(item),
        })),
        domains: (domains || []).map((item: any) => ({
            value: item.id,
            label: localizedLookupLabel(item),
        })),
        departments: (departments || []).map((item: any) => ({
            value: item.id,
            label: localizedLookupLabel(item),
        })),
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

    const tableWidth = finalColumns.reduce((sum, col) => sum + (col.width as number || 100), 0);

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

                <AppTable
                    components={{ header: { cell: ResizableTitle } }}
                    columns={finalColumns}
                    dataSource={data?.data || []}
                    rowKey="id"
                    skeletonLoading={isLoading}
                    tableLayout="fixed"
                    rowClassName={(record) => getRowClassName(record.status)}
                    scroll={{
                        x: tableWidth,
                    }}
                    sticky
                    pagination={false}
                />
            </ConfigProvider>
        </div>
    );
};

export default TicketList;
