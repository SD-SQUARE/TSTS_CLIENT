import React from 'react';
import { Checkbox } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: string;
    label: string;
    isChecked: boolean;
    onCheck: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, label, isChecked, onCheck }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        background: isDragging ? '#fafafa' : 'transparent',
        zIndex: isDragging ? 1000 : 1,
        borderRadius: '4px',
        border: isDragging ? '1px solid #91caff' : '1px solid transparent',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <HolderOutlined
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab', marginRight: 8, color: '#bfbfbf' }}
            />
            <Checkbox checked={isChecked} onChange={() => onCheck(id)}>
                {label}
            </Checkbox>
        </div>
    );
};

export default SortableItem;