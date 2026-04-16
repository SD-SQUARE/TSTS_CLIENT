/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { getSavedData } from '../Components/ticketListComponents/storageUtils';
import { DEFAULT_COL_WIDTHS } from '../Components/ticketListComponents/ticketConstants';

interface UseColumnSettingsOptions {
    defaultColumnKeys: string[];
}

export const useColumnSettings = ({ defaultColumnKeys }: UseColumnSettingsOptions) => {
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
        getSavedData('ticket_visible_columns', defaultColumnKeys)
    );

    const [columnOrder, setColumnOrder] = useState<string[]>(() =>
        getSavedData('ticket_column_order', defaultColumnKeys)
    );

    const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
        getSavedData('ticket_column_widths', DEFAULT_COL_WIDTHS)
    );

    useEffect(() => {
        localStorage.setItem('ticket_visible_columns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        localStorage.setItem('ticket_column_order', JSON.stringify(columnOrder));
    }, [columnOrder]);

    useEffect(() => {
        localStorage.setItem('ticket_column_widths', JSON.stringify(colWidths));
    }, [colWidths]);

    const handleResize = (key: string) => (_e: unknown, { size }: { size: { width: number } }) => {
        setColWidths((prev) => {
            const newWidths = { ...prev, [key]: size.width };
            localStorage.setItem('ticket_column_widths', JSON.stringify(newWidths));
            return newWidths;
        });
    };

    const onDragEnd = ({ active, over }: any) => {
        if (active.id !== over?.id) {
            setColumnOrder((prev) => {
                const activeIndex = prev.indexOf(active.id);
                const overIndex = prev.indexOf(over.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const resetSettings = (defaultKeys: string[]) => {
        setColumnOrder(defaultKeys);
        setVisibleColumns(defaultKeys);
        setColWidths(DEFAULT_COL_WIDTHS);
        localStorage.removeItem('ticket_column_order');
        localStorage.removeItem('ticket_visible_columns');
        localStorage.removeItem('ticket_column_widths');
    };

    return {
        visibleColumns,
        setVisibleColumns,
        columnOrder,
        setColumnOrder,
        colWidths,
        handleResize,
        onDragEnd,
        resetSettings,
    };
};