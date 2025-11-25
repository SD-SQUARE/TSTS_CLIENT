/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Steps, Button, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';


import StepInfo from './GroupFormSteps/StepInfo';
import StepManagers from './GroupFormSteps/StepManagers';
import StepPermissions from './GroupFormSteps/StepPermissions';
import type { Group, GroupFormData } from './Types/groups';
import { useAddGroup, useEditGroup } from './Hooks/useGroupForm';


interface GroupFormModalProps {
    isVisible: boolean;
    onClose: () => void;
    groupData?: Group;
}



const steps = [
    { title: 'info', component: StepInfo },
    { title: 'managers', component: StepManagers },
    { title: 'permissions', component: StepPermissions },
];


const initialFormData: GroupFormData = {
    nameArabic: '',
    nameEnglish: '',
    descriptionArabic: '',
    descriptionEnglish: '',
    color: '#60203d',
    heads: [],
    teamLeaders: null,
    specializations: [],
};

const cleanPayload = (data: GroupFormData) => {
    const payload: any = {
        name_ar: data.nameArabic,
        name_en: data.nameEnglish,
        description_ar: data.descriptionArabic,
        description_en: data.descriptionEnglish,
        color: data.color
    };

    if (data.teamLeaders && data.teamLeaders.id) {
        payload.team_leader_id = data.teamLeaders.id;
    } else {
        payload.team_leader_id = null;
    }

    payload.heads = data.heads.map(item => item.id);
    payload.specializations = data.specializations.map(item => item.id);
    
    return payload; 
};

const GroupFormModal: React.FC<GroupFormModalProps> = ({ isVisible, onClose, groupData }) => {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState<GroupFormData>(initialFormData);
    const [stepSubmitTrigger, setStepSubmitTrigger] = useState<(() => void) | null>(null);
    const isEditing = !!groupData;

    const resetKey = isVisible ? 'visible' : 'hidden';

    const memoFormData = useMemo(() => formData, [formData]);
    const addMutation = useAddGroup();

    const groupIdForEditHook = groupData?.id || 'dummy-id-for-add-mode';


    const editMutationResult = useEditGroup(groupIdForEditHook);


    const editMutation = isEditing ? editMutationResult : null;
    const isSubmitting = addMutation.isPending || editMutation?.isPending;

    const resetModalState = () => {

        setCurrent(0);

        setFormData(initialFormData);

        setStepSubmitTrigger(null);

        onClose();
    };


    useEffect(() => {
        if (groupData && isVisible) {
            //FIXME : fix this Render warning properly
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                nameArabic: groupData.name_ar,
                nameEnglish: groupData.name_en,
                descriptionArabic: groupData.description_ar,
                descriptionEnglish: groupData.description_en,
                color: groupData.color,
                heads: groupData.heads?.map(h => ({ id: h.id, name: h.name })) || [],
                specializations: groupData.specializations?.map(s => ({ id: s.id, name: s.name })) || [],
                teamLeaders: groupData.team_leader
                    ? { id: groupData.team_leader.id, name: groupData.team_leader.name }
                    : null,
            });
        } else if (!groupData && isVisible) {
            setFormData(initialFormData);
        }
        if (isVisible) {
            setCurrent(0);
        }
    }, [groupData, isVisible]);



    const next = (stepData: any) => {
        setFormData((prev) => ({ ...prev, ...stepData }));
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };


    const handleSubmit = useCallback(async (finalStepData: any) => {
        const finalData: GroupFormData = { ...formData, ...finalStepData };
        
        const cleanedPayload = cleanPayload(finalData);

        try {
            if (isEditing && editMutation) {
                console.log(cleanedPayload);
                await editMutation.mutateAsync(cleanedPayload); 
                message.success(t('group_form.edit_success'));
            } else {
                console.log(cleanedPayload);
                await addMutation.mutateAsync(cleanedPayload); 
                message.success(t('group_form.add_success'));
            }
            resetModalState();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || t('group_form.submit_error');
            message.error(errorMsg);
        }
    }, [formData, isEditing, addMutation, editMutation, t, resetModalState]);


    const CurrentStepComponent = steps[current].component;
    const isLastStep = current === steps.length - 1;

    const handleTriggerSubmit = useCallback((trigger: () => void) => {
        setStepSubmitTrigger(() => trigger);
    }, []);


    return (
        <Modal
            key={resetKey}
            title={t(isEditing ? 'group_form.edit_title' : 'group_form.add_title')}
            open={isVisible}
            onCancel={resetModalState}
            footer={null}
            width={700}
        >
            <Steps current={current} style={{ marginBottom: 24 }}>
                {steps.map(item => (
                    <Steps.Step key={item.title} title={t(`group_form.step_${item.title}`)} />
                ))}
            </Steps>

            <div className="steps-content">
                <CurrentStepComponent
                    initialData={memoFormData}
                    onNext={next}
                    onSubmit={handleSubmit}

                    isSubmitting={isSubmitting}
                    onTriggerSubmit={handleTriggerSubmit}
                />
            </div>

            <div className="steps-action" style={{ marginTop: 24, textAlign: 'right' }}>
                <Space>
                    {current > 0 && (
                        <Button style={{ margin: '0 8px' }} onClick={prev} disabled={isSubmitting}>
                            {t('group_form.previous')}
                        </Button>
                    )}
                    {!isLastStep && (


                        <Button form="step-form" type="primary" htmlType="submit" disabled={isSubmitting}>
                            {t('group_form.next')}
                        </Button>
                    )}
                    {isLastStep && (
                        <Button
                            type="primary"
                            loading={isSubmitting}

                            onClick={() => stepSubmitTrigger && stepSubmitTrigger()}
                        >
                            {t('group_form.submit')}
                        </Button>
                    )}
                </Space>
            </div>
        </Modal>
    );
};

export default GroupFormModal;