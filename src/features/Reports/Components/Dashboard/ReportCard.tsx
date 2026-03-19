import React from 'react';
import { Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ReportItem } from '../../Types/reports';

const { Paragraph } = Typography;

interface ReportCardProps {
    report: ReportItem;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
    const navigate = useNavigate();

    return (
        <Card
            hoverable
            title={report.title}
            onClick={() => navigate(`/reports/${report.id}`)}
            style={{ height: '100%', borderRadius: '8px' }}
            styles={{ body: { padding: '16px' } }}
        >
            <Paragraph
                ellipsis={{ rows: 3 }}
                type="secondary"
                style={{ marginBottom: 0 }}
            >
                {report.description}
            </Paragraph>
        </Card>
    );
};

export default ReportCard;