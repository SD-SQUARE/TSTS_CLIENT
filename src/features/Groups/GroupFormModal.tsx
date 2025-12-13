/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Steps, Button, Space, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleFilled } from '@ant-design/icons';

import StepInfo from './GroupFormSteps/StepInfo';
import StepManagers from './GroupFormSteps/StepManagers';
import StepPermissions from './GroupFormSteps/StepPermissions';
import type { Group, GroupFormData } from './Types/groups';
import { useAddGroup, useEditGroup, useGroupDetail } from './Hooks/useGroupForm';


interface GroupFormModalProps {
    isVisible: boolean;
    onClose: () => void;
    groupData?: Group;
}

interface ApiErrorField {
    field: string;
    message: string;
}

const generateDarkRandomColor = (): string => {
    const generateHexSegment = () => {
        const num = Math.floor(Math.random() * 81);
        return num.toString(16).padStart(2, '0');
    };

    const r = generateHexSegment();
    const g = generateHexSegment();
    const b = generateHexSegment();

    return `#${r}${g}${b}`;
};


const steps = [
    { title: 'info', component: StepInfo },
    { title: 'managers', component: StepManagers },
    { title: 'permissions', component: StepPermissions },
];


const initialFormData: GroupFormData = {
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    color: '#60203d',
    heads: [],
    team_leader: null,
    specializations: [],
};

const cleanPayload = (data: GroupFormData) => {
    const payload: any = {
        name_ar: data.name_ar,
        name_en: data.name_en,
        description_ar: data.description_ar,
        description_en: data.description_en,
        color: data.color
    };

    if (data.team_leader && data.team_leader.id) {
        payload.team_leader_id = data.team_leader.id;
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
    // const [stepSubmitTrigger, setStepSubmitTrigger] = useState<(() => void) | null>(null);
    const [apiErrors, setApiErrors] = useState<ApiErrorField[]>([]);
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
        // setStepSubmitTrigger(null);
        setApiErrors([]);
        onClose();
    };

    const isFirstStepDirty = () => {
        return (
            formData.name_ar !== initialFormData.name_ar ||
            formData.name_en !== initialFormData.name_en ||
            formData.description_ar !== initialFormData.description_ar ||
            formData.description_en !== initialFormData.description_en
        );
    };

    const handleConfirmClose = () => {

        const isCleanInAddMode = !groupData && current === 0 && !isFirstStepDirty();

        if (isCleanInAddMode) {
            resetModalState();
            return;
        }

        Modal.confirm({
            title: t('group_form.confirm_cancel_title'),
            icon: <ExclamationCircleFilled />,
            content: t('group_form.confirm_cancel_content'),
            okText: t('group_form.confirm_cancel_ok'),
            cancelText: t('group_form.confirm_cancel_abort'),
            centered: true,

            onOk() {
                resetModalState();
            },
            onCancel() { },
        });
    };

    const { data: fetchedGroupDetail, isLoading: isFetchingDetail } = useGroupDetail(groupData?.id);
    const isModalLoading = isEditing && isFetchingDetail;
    useEffect(() => {
        if (!isVisible) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrent(0);
            setFormData(initialFormData);
            setApiErrors([]);
            return;
        }
        if (groupData) {
            //FIXME : fix this Render warning properly
            if (fetchedGroupDetail) {

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData({
                    name_ar: fetchedGroupDetail.name_ar,
                    name_en: fetchedGroupDetail.name_en,
                    description_ar: fetchedGroupDetail.description_ar,
                    description_en: fetchedGroupDetail.description_en,
                    color: fetchedGroupDetail.color,
                    heads: fetchedGroupDetail.heads?.map(h => ({ id: h.id, name: h.name })) || [],
                    specializations: fetchedGroupDetail.specializations?.map(s => ({ id: s.id, name: s.name })) || [],
                    team_leader: fetchedGroupDetail.team_leader
                        ? { id: fetchedGroupDetail.team_leader.id, name: fetchedGroupDetail.team_leader.name }
                        : null,
                });
                setCurrent(0);
            }
        } else {
            setFormData(initialFormData);
            setCurrent(0);
        }
        setApiErrors([]);
    }, [groupData, isVisible, fetchedGroupDetail]);



    const next = (stepData: any) => {
        setApiErrors([]);
        setFormData((prev) => ({ ...prev, ...stepData }));
        setCurrent(current + 1);
    };

    const prev = () => {
        setApiErrors([]);
        setCurrent(current - 1);
    };


    const handleSubmit = useCallback(async (finalStepData: any) => {
        const finalData: GroupFormData = { ...formData, ...finalStepData };
        if (!isEditing) {
            finalData.color = generateDarkRandomColor();
        }
        const cleanedPayload = cleanPayload(finalData);

        try {
            if (isEditing && editMutation) {
                await editMutation.mutateAsync(cleanedPayload);
                message.success(t('group_form.edit_success'));
            } else {
                await addMutation.mutateAsync(cleanedPayload);
                message.success(t('group_form.add_success'));
            }
            resetModalState();
        } catch (error: any) {
            if (error.response && error.response.data && Array.isArray(error.response.data.errors)) {
                const nameErrors = error.response.data.errors.filter((err: any) =>
                    err.msgKey === 'name_ar' || err.msgKey === 'name_en'
                );

                if (nameErrors.length > 0) {
                    setApiErrors(nameErrors.map((err: any) => ({
                        field: err.msgKey,
                        message: err.message
                    })));
                    setCurrent(0);
                    return;
                }
            }
            const errorMsg = error.response?.data?.message || t('group_form.submit_error');
            message.error(errorMsg);
        }
    }, [formData, isEditing, addMutation, editMutation, t, resetModalState]);


    const CurrentStepComponent = steps[current].component;
    const isLastStep = current === steps.length - 1;

    // const handleTriggerSubmit = useCallback((trigger: () => void) => {
    //     setStepSubmitTrigger(() => trigger);
    // }, []);
    const stepItems = useMemo(() => steps.map(item => ({
        key: item.title,
        title: t(`group_form.step_${item.title}`),
    })), [t]);

    return (
        <Modal
            key={resetKey}
            title={t(isEditing ? 'group_form.edit_title' : 'group_form.add_title')}
            open={isVisible}
            onCancel={handleConfirmClose}
            maskClosable={false}
            footer={null}
            width="85vw"
            style={{ top: 50 }}
        >

            <Spin spinning={isModalLoading}>
                <Steps current={current} style={{ marginBottom: 24 }} items={stepItems} />

                <div className="steps-content">
                    <CurrentStepComponent
                        initialData={memoFormData}
                        onNext={next}
                        onSubmit={handleSubmit}

                        isSubmitting={isSubmitting}
                        // onTriggerSubmit={handleTriggerSubmit}

                        apiErrors={apiErrors}
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
                                form='step-form'
                                htmlType='submit'
                                type="primary"
                                loading={isSubmitting}

                            // onClick={() => stepSubmitTrigger && stepSubmitTrigger()}
                            >
                                {t('group_form.submit')}
                            </Button>
                        )}
                    </Space>
                </div>
            </Spin>
        </Modal>
    );
};

export default GroupFormModal;