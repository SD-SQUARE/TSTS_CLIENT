import React from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTicketMutations } from '../../Hooks/useTicketForm';
import AssigneeList from '../AssigneesList';


interface InlineEditorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    record: any;
    onSuccess?: () => void;
}

const AssigneeInlineEditor: React.FC<InlineEditorProps> = ({ record, onSuccess }) => {
    const { t } = useTranslation();
    const { coordinateMutation } = useTicketMutations(record.id);

    const handleUpdate = (newIds: string[]) => {
        const formData = new FormData();
        formData.append('title', record.title);
        formData.append('assigneeList', JSON.stringify(newIds));

        coordinateMutation.mutate(formData, {
            onSuccess: () => {
                message.success(t('success.updated'));
                if (onSuccess) onSuccess();
            }
        });
    };

    return (
        <div style={{ width: 350 }} onKeyDown={(e) => e.stopPropagation()}>
            <AssigneeList
                assignees={record.assignee || []}
                requesterId={record.requester?.id}
                onUpdateAssignees={handleUpdate}
                isUpdating={coordinateMutation.isPending}
                forceEdit={true} 
            />
        </div>
    );
};
export default AssigneeInlineEditor;