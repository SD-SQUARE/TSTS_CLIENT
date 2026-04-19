import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import { useTranslation } from 'react-i18next';

interface ResizableTitleProps {
    onResize: (e: React.SyntheticEvent, data: { size: { width: number; height: number } }) => void;
    width?: number;
    [key: string]: unknown;
}

const ResizableTitle: React.FC<ResizableTitleProps> = ({ onResize, width, ...restProps }) => {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [tempWidth, setTempWidth] = useState(width);

    useEffect(() => {
        setTempWidth(width);
    }, [width]);

    if (!width) return <th {...restProps} />;

    return (
        <Resizable
            width={tempWidth!}
            height={0}
            resizeHandles={[isRtl ? 'w' : 'e']}
            handle={(resizeHandle, ref) => (
                <span
                    ref={ref as React.RefObject<HTMLSpanElement>}
                    className={`react-resizable-handle react-resizable-handle-${resizeHandle}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        height: '100%',
                        width: '10px',
                        cursor: 'col-resize',
                        zIndex: 100,
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            )}
            onResize={(_, { size }) => setTempWidth(size.width)}
            onResizeStop={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th
                {...restProps}
                style={{
                    ...((restProps.style as React.CSSProperties) || {}),
                    width: tempWidth,
                    position: ((restProps.style as React.CSSProperties) || {}).position,
                    transition: 'none',
                }}
            />
        </Resizable>
    );
};

export default ResizableTitle;
