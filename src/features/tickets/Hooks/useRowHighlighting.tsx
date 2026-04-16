import { useState, useEffect } from 'react';
import { getSavedData } from '../Components/ticketListComponents/storageUtils';
import { TICKET_STATUS } from '../Components/ticketListComponents/ticketConstants';

export const useRowHighlighting = () => {
    const [showRowColors, setShowRowColors] = useState<boolean>(() =>
        getSavedData('ticket_show_row_colors', false)
    );

    const [highlightedStatuses, setHighlightedStatuses] = useState<string[]>(() =>
        getSavedData('ticket_highlighted_statuses', [TICKET_STATUS.CLOSED])
    );

    useEffect(() => {
        localStorage.setItem('ticket_show_row_colors', JSON.stringify(showRowColors));
        localStorage.setItem('ticket_highlighted_statuses', JSON.stringify(highlightedStatuses));
    }, [showRowColors, highlightedStatuses]);

    const getRowClassName = (status: string): string => {
        if (!showRowColors) return '';

        const isHighlighted = highlightedStatuses.some(
            (s) => s.toLowerCase().trim() === status.toLowerCase().trim()
        );

        return isHighlighted
            ? `row-highlight-${status.toLowerCase().replace(/\s+/g, '-')}`
            : '';
    };

    return {
        showRowColors,
        setShowRowColors,
        highlightedStatuses,
        setHighlightedStatuses,
        getRowClassName,
    };
};