/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Popover } from "antd";
import { EditOutlined} from '@ant-design/icons';
import AssigneeInlineEditor from "./AssigneeInlineEditor";
import EllipsisComponent from "../../../../components/EllipsisComponent";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const AssigneeColumnCell: React.FC<{ record: any, assignees: any[] }> = ({ record, assignees }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = React.useState(false);
    const currentUserRole = useSelector((state: any) => state.auth.user?.role?.toLowerCase?.() || '');
    const canInlineEdit = ['admin', 'technician', 'superadmin'].includes(currentUserRole);
    
    const assigneeNames = assignees
        ?.map((a) => a.name || `${a.first_name} ${a.last_name}`.trim())
        .filter(Boolean) || [];
    const isUnassigned = assigneeNames.length === 0;
    const assigneeText = assigneeNames.length > 0 ? assigneeNames.join(', ') : t('tickets.unassigned');

    return (
        <Flex align="center" justify="space-between" gap="small">
            <Popover
                content={
                    <div style={{ maxWidth: 300, color: isUnassigned ? 'rgba(0, 0, 0, 0.45)' : undefined }}>
                        {assigneeText}
                    </div>
                }
                trigger="hover"
            >
                <div
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        color: isUnassigned ? 'rgba(0, 0, 0, 0.45)' : undefined,
                    }}
                >
                    <EllipsisComponent content={assigneeText} />
                </div>
            </Popover>

            {canInlineEdit && (
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
            )}
        </Flex>
    );
};

export default AssigneeColumnCell;
