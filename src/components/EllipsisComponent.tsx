// import { Typography } from 'antd';
// import React, { useMemo, useState } from 'react';
// import  DOMPurify  from 'dompurify';
// interface EllipsisComponentProps {
//     content: any;
//     percentage?: number; // default 25%
//     isDescription?: boolean
// }

// const EllipsisComponent: React.FC<EllipsisComponentProps> = ({
//     content,
//     percentage = 50,
//     isDescription = false
// }) => {
//     const [expanded, setExpanded] = useState(false);

//     const previewText = useMemo(() => {
//         if (!content) return '';
//         const length = Math.ceil((content.length * percentage) / 100);
//         return content.slice(0, length);
//     }, [content, percentage]);

//     const shouldTruncate = content.length > previewText.length;

//     return (
//         <Typography.Paragraph style={{ margin: 0 }}>
            
//             {isDescription  ? (
//                 <div
//                     style={{ wordBreak: 'break-word' }}
//                     dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(expanded || !shouldTruncate ? content : `${previewText}` || '') }}
//                 />
//             ) :
//                 (expanded || !shouldTruncate) ? content : `${previewText}...`
//             }
//             {shouldTruncate && (
//                 <Typography.Link
//                     style={{ marginLeft: 8 }}
//                     onClick={() => setExpanded(prev => !prev)}
//                 >
//                     {expanded ? 'Less' : 'More'}
//                 </Typography.Link>
//             )}
//         </Typography.Paragraph>
//     );
// };

// export default EllipsisComponent;


import { Typography } from 'antd';
import React, { useState } from 'react';

interface EllipsisComponentProps {
    content: React.ReactNode;
    copyable?: boolean;
}

const EllipsisComponent: React.FC<EllipsisComponentProps> = ({ content, copyable = false }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Typography.Paragraph
        copyable={copyable}
            style={{ margin: 0 }}
            ellipsis={{
                rows: 1,
                expandable: 'collapsible',
                expanded,
                onExpand: (e, info) => {
                    e.stopPropagation(); 
                    setExpanded(info.expanded);
                }
            }}
        >
            {content}
        </Typography.Paragraph>
    );
};

export default EllipsisComponent;