import { Typography } from 'antd';
import React, { useState } from 'react';

interface EllipsisComponentProps {
    content: string;
}

const EllipsisComponent: React.FC<EllipsisComponentProps> = ({ content }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Typography.Paragraph
            style={{ margin: 0 }}
            ellipsis={{
                rows: 1,
                expandable: 'collapsible',
                expanded,
                onExpand: (_, info) => setExpanded(info.expanded)
            }}
        >
            {content}
        </Typography.Paragraph>
    );
};

export default EllipsisComponent;