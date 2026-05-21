/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
    Typography, Alert, Pagination, Space, Button, Flex, Popover, Tooltip, Tag, Row, Col, Card, Statistic,
} from 'antd';
import {
    AlertOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    InboxOutlined,
    PlusOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import arEG from 'antd/lib/locale/ar_EG';
import { useSelector } from 'react-redux';

import AppTable from '../../../components/AppTable';
import {
    useRequestersLookup,
    useTicketDepartmentsLookup,
    useTicketDomainsLookup,
    useTicketUniversitiesLookup,
    useTicketAnalytics,
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
    const authRole = useSelector((state: any) => state.auth.user?.role?.toLowerCase?.() || '');
    const effectiveRole = authRole || role || '';
    const isRequester = effectiveRole === 'requester';

    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });
    const [apiSearchQuery, setApiSearchQuery] = useState<TicketSearchQuery>({});

    const { data, isLoading, isError, error } = useTickets(
        pagination.page,
        pagination.pageSize,
        apiSearchQuery,
    );
    const { data: analyticsData, isLoading: analyticsLoading } = useTicketAnalytics();
    const ticketRows = data?.data || [];
    const shouldLoadStaffLookups = !isRequester;
    const { data: specs } = useSpecializations();
    const { data: hierarchicalProblems } = useTicketProblems();
    const { data: technicians } = useTechnicians(shouldLoadStaffLookups);
    const { data: admins } = useAdmins(shouldLoadStaffLookups);
    const { data: requesters } = useRequestersLookup(!isRequester);
    const { data: universities } = useTicketUniversitiesLookup(shouldLoadStaffLookups);
    const { data: domains } = useTicketDomainsLookup(shouldLoadStaffLookups);
    const { data: departments } = useTicketDepartmentsLookup(shouldLoadStaffLookups);

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
        role: effectiveRole,
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
        handleView: (id: string) => navigate(`/${effectiveRole}/tickets/${id}`),
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
    const analytics = useMemo(() => {
        const valueOf = (key: string) => analyticsData?.[key] ?? 0;
        const metric = (
            key: string,
            label: string,
            icon: React.ReactNode,
            tone: { bg: string; border: string; color: string },
        ) => ({
            key,
            label,
            value: valueOf(key),
            icon,
            tone,
        });

        if (isRequester) {
            return [
                metric('total', t('tickets.analytics.myTickets'), <UserOutlined />, { bg: '#eef6ff', border: '#91caff', color: '#1677ff' }),
                metric('open', t('tickets.analytics.open'), <InboxOutlined />, { bg: '#f6ffed', border: '#b7eb8f', color: '#389e0d' }),
                metric('resolved', t('tickets.analytics.resolved'), <CheckCircleOutlined />, { bg: '#f6fffb', border: '#87e8de', color: '#08979c' }),
            ];
        }

        if (effectiveRole === 'technician') {
            return [
                metric('assigned', t('tickets.analytics.assigned'), <TeamOutlined />, { bg: '#eef6ff', border: '#91caff', color: '#1677ff' }),
                metric('inProgress', t('tickets.analytics.inProgress'), <ClockCircleOutlined />, { bg: '#fffbe6', border: '#ffe58f', color: '#d48806' }),
                metric('open', t('tickets.analytics.open'), <InboxOutlined />, { bg: '#f6ffed', border: '#b7eb8f', color: '#389e0d' }),
                metric('slaViolated', t('tickets.analytics.slaViolated'), <AlertOutlined />, { bg: '#fff1f0', border: '#ffa39e', color: '#cf1322' }),
            ];
        }

        return [
            metric('total', t('tickets.analytics.total'), <TeamOutlined />, { bg: '#eef6ff', border: '#91caff', color: '#1677ff' }),
            metric('unassigned', t('tickets.analytics.unassigned'), <InboxOutlined />, { bg: '#fff7e6', border: '#ffd591', color: '#d46b08' }),
            metric('inProgress', t('tickets.analytics.inProgress'), <ClockCircleOutlined />, { bg: '#fffbe6', border: '#ffe58f', color: '#d48806' }),
            metric('slaViolated', t('tickets.analytics.slaViolated'), <AlertOutlined />, { bg: '#fff1f0', border: '#ffa39e', color: '#cf1322' }),
        ];
    }, [analyticsData, effectiveRole, isRequester, t]);

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
                        {isRequester && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(`/${effectiveRole}/tickets/new-ticket`)}
                            >
                                {t('tickets.new_ticket')}
                            </Button>
                        )}
                    </Space>
                </Flex>

                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    {analytics.map((item) => (
                        <Col xs={24} sm={12} lg={6} key={item.key}>
                            <Card
                                size="small"
                                loading={analyticsLoading}
                                style={{
                                    borderColor: item.tone.border,
                                    background: `linear-gradient(180deg, #fff 0%, ${item.tone.bg} 100%)`,
                                    borderRadius: 8,
                                }}
                            >
                                <Flex align="center" gap={12}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            display: 'grid',
                                            placeItems: 'center',
                                            borderRadius: 8,
                                            color: item.tone.color,
                                            background: '#fff',
                                            border: `1px solid ${item.tone.border}`,
                                            flex: '0 0 auto',
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.label}
                                        </Typography.Text>
                                        <Statistic value={item.value} valueStyle={{ fontSize: 22, color: item.tone.color, lineHeight: 1.15 }} />
                                    </div>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <AppTable
                    components={{ header: { cell: ResizableTitle } }}
                    columns={finalColumns}
                    dataSource={ticketRows}
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
