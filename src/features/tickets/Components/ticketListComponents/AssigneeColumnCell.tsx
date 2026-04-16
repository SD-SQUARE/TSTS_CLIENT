/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Popover } from "antd";
import { EditOutlined} from '@ant-design/icons';
import AssigneeInlineEditor from "./AssigneeInlineEditor";
import EllipsisComponent from "../../../../components/EllipsisComponent";
import React from "react";

const AssigneeColumnCell: React.FC<{ record: any, assignees: any[] }> = ({ record, assignees }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    
    const assigneeNames = assignees
        ?.map((a) => a.name || `${a.first_name} ${a.last_name}`.trim())
        .filter(Boolean) || [];

    return (
        <Flex align="center" justify="space-between" gap="small">
            <Popover
                content={<div style={{ maxWidth: 300 }}>{assigneeNames.join(', ')}</div>}
                trigger="hover"
            >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <EllipsisComponent content={assigneeNames.join(', ')} />
                </div>
            </Popover>

            <Popover
                content={
                    <AssigneeInlineEditor 
                        record={record} 
                        onSuccess={() => setIsVisible(false)} 
                    />
                }
                trigger="click"
                open={isVisible}
                onOpenChange={setIsVisible}
                placement="bottomRight"
                destroyTooltipOnHide
            >
                <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined style={{ fontSize: '12px', color: '#1677ff' }} />} 
                    onClick={(e) => e.stopPropagation()}
                />
            </Popover>
        </Flex>
    );
};

export default AssigneeColumnCell;