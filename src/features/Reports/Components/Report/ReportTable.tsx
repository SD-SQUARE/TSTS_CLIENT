/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo } from 'react';
import { Card, Table } from 'antd';
import type { DynamicColumn } from '../../Types/reports';
import { getColumnSearchProps } from '../../utils/TableFilters';

interface Props {
    columns?: DynamicColumn[];
    records?: Record<string, any>[];
    loading: boolean;
    title: string;
    filtersList: string[];
    activeFilters: { column: string; value: string }[];
    onFiltersChange: (filters: { column: string; value: string }[]) => void;
}

const ReportTable: React.FC<Props> = ({ columns, records, loading, title, filtersList = [], activeFilters, onFiltersChange }) => {

    const handleFilterUpdate = useCallback((column: string, value: string | undefined) => {
        let newFilters = [...activeFilters];
        if (!value) {
            newFilters = newFilters.filter(f => f.column !== column);
        } else {
            const index = newFilters.findIndex(f => f.column === column);
            if (index > -1) newFilters[index].value = value;
            else newFilters.push({ column, value });
        }
        onFiltersChange(newFilters);
    }, [activeFilters, onFiltersChange]);

    const mappedColumns = useMemo(() => {
        const safeFilters = filtersList || [];

        return columns?.map(col => {
            const baseCol: any = {
                title: col.label,
                dataIndex: col.key,
                key: col.key,
            };

            if (safeFilters.includes(col.key)) {
                Object.assign(baseCol, getColumnSearchProps(col.key, activeFilters, handleFilterUpdate));
            }

            return baseCol;
        }) || [];
    }, [columns, filtersList, activeFilters, handleFilterUpdate]);

    return (
        <Card title={title}>
            <Table
                dataSource={records}
                columns={mappedColumns}
                loading={loading}
                rowKey={(record, index) => record.id || index}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
        </Card>
    );
};

export default ReportTable;