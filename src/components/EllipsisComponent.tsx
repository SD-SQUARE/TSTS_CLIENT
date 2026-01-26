import { Typography } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EllipsisComponentProps {
    content: React.ReactNode;
}

const EllipsisComponent: React.FC<EllipsisComponentProps> = ({ content }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    return (
        <Typography.Paragraph
            style={{ margin: 0 }}
            ellipsis={{
                rows: 1,
                expandable: 'collapsible',
                symbol: expanded ? t('common.collapse') : t('common.expand'),
                expanded,
                onExpand: (_, info) => setExpanded(info.expanded)
            }}
        >
            {content}
        </Typography.Paragraph>
    );
};

export default EllipsisComponent;