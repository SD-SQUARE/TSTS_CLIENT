/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Select, TreeSelect } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../api/http';
import { t } from 'i18next';

interface FilterSelectProps {
    columnKey: string;
    apiEndpoint: string;
    value: string | undefined;
    onChange: (val: string | undefined) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ columnKey, apiEndpoint, value, onChange }) => {
    const translatedPlaceholder = `${t('common.select')} ${columnKey}`;

    const { data, isLoading } = useQuery({
        queryKey: ['lockup', columnKey, apiEndpoint],
        queryFn: async () => (await api.get(`/v1/lockups/${apiEndpoint}`)).data,
        staleTime: 1000 * 60 * 5,
    });

    if (columnKey === 'problem') {
        const treeData = data?.specializations?.map((spec: any) => ({
            title: spec.name,
            value: `spec-${spec.id}`,
            selectable: false,
            children: spec.problems?.map((prob: any) => ({
                title: prob.name,
                value: prob.id,
            })),
        })) || [];

        return (
            <TreeSelect
                showSearch
                style={{ width: 300 }}
                value={value}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder={translatedPlaceholder}
                allowClear
                treeDefaultExpandAll={false}
                onChange={onChange}
                treeData={treeData}
                loading={isLoading}
                treeNodeFilterProp="title"
            />
        );
    }

    // Standard Select logic for other filters (users, domains, etc.)
    const listData = Array.isArray(data) ? data : (data?.[apiEndpoint] || []);

    return (
        <Select
            showSearch
            allowClear
            loading={isLoading}
            placeholder={translatedPlaceholder}
            style={{ width: 200 }}
            value={value}
            onChange={onChange}
            options={listData.map((opt: any) => ({
                label: apiEndpoint === 'users' ? `${opt.first_name} ${opt.last_name}` : opt.name,
                value: opt.id,
            }))}
            optionFilterProp="label"
        />
    );
};

export default FilterSelect;