/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Flex, Typography, Switch, Checkbox, Button } from 'antd';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import type { Ticket } from '../../Types/tickets';
import { TICKET_STATUS } from './ticketConstants';
import SortableItem from './sortableItem';

interface ColumnControlPanelProps {
    columns: ColumnsType<Ticket>;
    columnOrder: string[];
    visibleColumns: string[];
    showRowColors: boolean;
    highlightedStatuses: string[];
    sensors: ReturnType<typeof import('@dnd-kit/core').useSensors>;
    onDragEnd: (event: any) => void;
    onVisibilityChange: (id: string) => void;
    onShowRowColorsChange: (checked: boolean) => void;
    onHighlightedStatusesChange: (statuses: string[]) => void;
    onReset: () => void;
}

const ColumnControlPanel: React.FC<ColumnControlPanelProps> = ({
    columns,
    columnOrder,
    visibleColumns,
    showRowColors,
    highlightedStatuses,
    sensors,
    onDragEnd,
    onVisibilityChange,
    onShowRowColorsChange,
    onHighlightedStatusesChange,
    onReset,
}) => {
    const { t } = useTranslation();

    const statusOptions = [
        { label: t('status.open'), value: TICKET_STATUS.OPEN },
        { label: t('status.re_open'), value: TICKET_STATUS.RE_OPEN },
        { label: t('status.in_progress'), value: TICKET_STATUS.IN_PROGRESS },
        { label: t('status.pending'), value: TICKET_STATUS.PENDING },
        { label: t('status.closed'), value: TICKET_STATUS.CLOSED },
        { label: t('status.resolved'), value: TICKET_STATUS.RESOLVED },
    ];

    return (
        <div style={{ padding: '4px', width: '260px' }}>
            {/* Row Highlighting Section */}
            <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: showRowColors ? 8 : 0 }}>
                    <Typography.Text strong>{t('common.row_highlighting')}</Typography.Text>
                    <Switch size="small" checked={showRowColors} onChange={onShowRowColorsChange} />
                </Flex>

                {showRowColors && (
                    <Checkbox.Group
                        options={statusOptions}
                        value={highlightedStatuses}
                        onChange={(list) => onHighlightedStatusesChange(list as string[])}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '4px',
                            fontSize: '12px',
                        }}
                    />
                )}
            </div>

            {/* Column Reset & Sort Section */}
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t('common.columns')}</Typography.Text>
                <Button
                    type="link"
                    size="small"
                    onClick={onReset}
                    danger
                    style={{ padding: 0, fontSize: '12px' }}
                >
                    {t('common.reset_layout')}
                </Button>
            </Flex>

            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                        <Flex vertical gap={2}>
                            {columnOrder.map((key) => {
                                const col = columns.find((c) => c.key === key);
                                return (
                                    <SortableItem
                                        key={key}
                                        id={key}
                                        label={col?.title as string}
                                        isChecked={visibleColumns.includes(key)}
                                        onCheck={onVisibilityChange}
                                    />
                                );
                            })}
                        </Flex>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default ColumnControlPanel;