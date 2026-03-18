import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import FilterSelect from '../Components/Report/FilterSelect';
import DebouncedSearchInput from '../Components/Report/DebouncedSearchFilter';

const LOCKUP_MAP: Record<string, string> = {
    'specialization': 'specializations',
    'problem': 'ticket/problems',
    'university': 'universities',
    'domain': 'domains',
    'department': 'departments',
    'group': 'groups',
    'user': 'users'
};

export const getColumnSearchProps = (
    columnKey: string,
    activeFilters: { column: string; value: string }[],
    handleFilterUpdate: (column: string, value: string | undefined) => void
) => {
    const lockupEndpoint = LOCKUP_MAP[columnKey];
    const isLockup = !!lockupEndpoint;

    const activeValue = activeFilters.find(f => f.column === columnKey)?.value;
    return {
        filterDropdown: () => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                {isLockup ? (
                    <FilterSelect
                        columnKey={columnKey}
                        apiEndpoint={lockupEndpoint}
                        value={activeValue}
                        onChange={(val) => handleFilterUpdate(columnKey, val)}
                    />
                ) : (
                    <DebouncedSearchInput
                        placeholder={`Search ${columnKey}`}
                        value={activeValue}
                        onChange={(val) => handleFilterUpdate(columnKey, val)}
                    />
                )}
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
    };
};