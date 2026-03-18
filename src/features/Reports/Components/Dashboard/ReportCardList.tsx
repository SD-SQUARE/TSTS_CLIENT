import React from 'react';
import { List, Empty } from 'antd';
import ReportCard from './ReportCard';
import type { ReportItem } from '../../Types/reports';
import { t } from 'i18next';

interface Props {
    reports?: ReportItem[];
    loading: boolean;
}

const ReportCardList: React.FC<Props> = ({ reports, loading }) => {
    return (
        <List
            grid={{ gutter: 20, xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
            dataSource={reports || []}
            loading={loading}
            locale={{ emptyText: <Empty description={t('dashboard.no_reports')} /> }}
            renderItem={(item) => (
                <List.Item>
                    <ReportCard report={item} />
                </List.Item>
            )}
        />
    );
};

export default ReportCardList;