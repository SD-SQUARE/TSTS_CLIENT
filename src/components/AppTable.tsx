import React from 'react';
import { Skeleton, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

type AppTableProps<T extends object> = TableProps<T> & {
    skeletonLoading?: boolean;
    skeletonRows?: number;
};

type SkeletonRecord = {
    __skeletonKey: string;
};

const SKELETON_WIDTHS = ['88%', '72%', '64%', '80%'];

const buildSkeletonColumns = (columns: ColumnsType<any>, depth = 0): ColumnsType<any> =>
    columns.map((column, index) => {
        const skeletonWidth = SKELETON_WIDTHS[(index + depth) % SKELETON_WIDTHS.length];

        if ('children' in column && Array.isArray(column.children) && column.children.length > 0) {
            return {
                ...column,
                sorter: undefined,
                sortOrder: undefined,
                filters: undefined,
                filterDropdown: undefined,
                filterIcon: undefined,
                onFilter: undefined,
                children: buildSkeletonColumns(column.children, depth + 1),
            };
        }

        return {
            ...column,
            sorter: undefined,
            sortOrder: undefined,
            filters: undefined,
            filterDropdown: undefined,
            filterIcon: undefined,
            onFilter: undefined,
            render: () => (
                <Skeleton.Input
                    active
                    size="small"
                    style={{ width: skeletonWidth, minWidth: 48 }}
                />
            ),
        };
    });

function AppTable<T extends object>({
    skeletonLoading = false,
    skeletonRows = 6,
    columns = [],
    dataSource,
    rowKey,
    loading,
    onRow,
    ...rest
}: AppTableProps<T>) {
    const skeletonData = React.useMemo(
        () =>
            Array.from({ length: skeletonRows }, (_, index) => ({
                __skeletonKey: `table-skeleton-${index}`,
            })) as Array<T & SkeletonRecord>,
        [skeletonRows],
    );

    const resolvedColumns = React.useMemo(
        () => (skeletonLoading ? buildSkeletonColumns(columns as ColumnsType<any>) : columns),
        [columns, skeletonLoading],
    );

    const resolvedData = skeletonLoading ? skeletonData : dataSource;

    const resolvedRowKey: TableProps<any>['rowKey'] = React.useMemo(() => {
        if (skeletonLoading) {
            return (record: SkeletonRecord) => record.__skeletonKey;
        }

        if (typeof rowKey === 'function') {
            return rowKey;
        }

        if (typeof rowKey === 'string') {
            return (record: Record<string, unknown>) => record[rowKey] as React.Key;
        }

        return (record: Record<string, unknown>) =>
            (record.key ?? record.id ?? JSON.stringify(record)) as React.Key;
    }, [rowKey, skeletonLoading]);

    return (
        <Table
            {...rest}
            columns={resolvedColumns}
            dataSource={resolvedData}
            rowKey={resolvedRowKey}
            loading={skeletonLoading ? false : loading}
            onRow={skeletonLoading ? undefined : onRow}
        />
    );
}

export default AppTable;
