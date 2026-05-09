/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Modal, Steps, Button,  message, Spin, Flex, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { ExclamationCircleFilled } from '@ant-design/icons';

import StepInfo from "./UsersFormSteps/StepInfo";
import StepContacts from "./UsersFormSteps/StepContacts";
import StepJobLocation from "./UsersFormSteps/StepJobs";
import StepPermissions from "./UsersFormSteps/StepPermissions";
import StepAccess from "./UsersFormSteps/StepAccess";
import type { UserFormData, UserListItem, UserPayload } from "../Types/users";
import { useAddOrEditUser, useUserDetail } from "../Hooks/useUsers";
import type { UserFormStepHandle } from "./UsersFormSteps/types";
import { getApiFieldErrors, getErrorMessage } from "../../../utils/error";





const initialFormData: UserFormData = {
    image: null,
    first_name_en: "",
    first_name_ar: "",
    mid_name_en: "",
    mid_name_ar: "",
    last_name_en: "",
    last_name_ar: "",
    full_name_en: "",
    full_name_ar: "",
    ssn: "",
    contacts: { phones: [], mobiles: [] },
    job_ar: "",
    job_en: "",
    university: null,
    domain: null,
    departments: [],
    permission_profile: null,
    specializations: [],
    email: "",
    password: "",
    status: "Active",
    user_type: "",
};

const UserFormModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    userData?: UserListItem;
    role: string;
    profileEditMode?: boolean;
}> = ({ isVisible, onClose, userData, role, profileEditMode = false }) => {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [submitErrors, setSubmitErrors] = useState<string[]>([]);
    const currentStepRef = useRef<UserFormStepHandle | null>(null);
    // const [stepSubmitTrigger, setStepSubmitTrigger] = useState<(() => void) | null>(null);

    const resetKey = isVisible ? 'visible' : 'hidden';


    const { data: fetchedUserDetail, isLoading: isFetchingDetail } = useUserDetail(role, userData?.id);
    const isModalLoading = isFetchingDetail;
    useEffect(() => {

        if (!isVisible) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrent(0);
            setFormData(initialFormData);
            setSubmitErrors([]);
            return;
        }
        if (userData) {
            //FIXME : fix this Render warning properly
            if (fetchedUserDetail) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData({
                    user_type: role,
                    image: fetchedUserDetail.image,
                    first_name_en: fetchedUserDetail.first_name_en,
                    first_name_ar: fetchedUserDetail.first_name_ar,
                    mid_name_en: fetchedUserDetail.mid_name_en,
                    mid_name_ar: fetchedUserDetail.mid_name_ar,
                    last_name_en: fetchedUserDetail.last_name_en,
                    last_name_ar: fetchedUserDetail.last_name_ar,
                    full_name_en: fetchedUserDetail.full_name_en,
                    full_name_ar: fetchedUserDetail.full_name_ar,
                    ssn: fetchedUserDetail.ssn,
                    contacts: { phones: fetchedUserDetail.contacts?.phones || [], mobiles: fetchedUserDetail.contacts?.mobiles || []},
                    job_en: fetchedUserDetail.job_en,
                    job_ar: fetchedUserDetail.job_ar,
                    university: fetchedUserDetail.university ?? null,
                    domain: fetchedUserDetail.domain ?? null,
                    departments: fetchedUserDetail.departments ?? [],
                    permission_profile: fetchedUserDetail.permission_profile ?? null,
                    specializations: fetchedUserDetail.specializations ?? [],
                    email: fetchedUserDetail.email || '',
                    password: "",
                    status: fetchedUserDetail.status,
                });
                setCurrent(0);
            }
        } else {
            setFormData(initialFormData);
            setCurrent(0);
            setSubmitErrors([]);
        }
    }, [userData, isVisible, fetchedUserDetail]);

    const addOrEditMutation = useAddOrEditUser(role, userData?.id);

    const resetModalState = () => {
        setCurrent(0);
        setFormData(initialFormData);
        setSubmitErrors([]);
        // setStepSubmitTrigger(null);
        onClose();
    };

    const isFirstStepDirty = (data: UserFormData) => {
        return (
            data.first_name_ar !== initialFormData.first_name_ar ||
            data.first_name_en !== initialFormData.first_name_en ||
            data.mid_name_ar !== initialFormData.mid_name_ar ||
            data.mid_name_en !== initialFormData.mid_name_en ||
            data.last_name_ar !== initialFormData.last_name_ar ||
            data.last_name_en !== initialFormData.last_name_en ||
            data.full_name_ar !== initialFormData.full_name_ar ||
            data.full_name_en !== initialFormData.full_name_en ||
            data.ssn !== initialFormData.ssn
        );
    };

    const syncCurrentStepData = () => {
        const latestValues = currentStepRef.current?.getValues();

        if (latestValues) {
            setFormData((prev) => ({ ...prev, ...latestValues }));
        }

        return latestValues;
    };

    const handleConfirmClose = () => {
        const latestValues = currentStepRef.current?.getValues();
        const latestFormData = latestValues ? { ...formData, ...latestValues } : formData;

        const isCleanInAddMode = !userData && current === 0 && !isFirstStepDirty(latestFormData);

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

    const next = (data: Partial<UserFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
        setCurrent((prev) => prev + 1);
    };
    const prev = () => {
        syncCurrentStepData();
        setCurrent((prev) => prev - 1);
    };

    const handleStepChange = (step: number) => {
        if (step === current) {
            return;
        }

        syncCurrentStepData();
        setCurrent(step);
    };

    const cleanPayload = (data: UserFormData) => {

        const isEdit = !!userData;
        const payload: Partial<UserPayload> = {
            first_name_en: data.first_name_en,
            first_name_ar: data.first_name_ar,
            mid_name_en: data.mid_name_en,
            mid_name_ar: data.mid_name_ar,
            last_name_en: data.last_name_en,
            last_name_ar: data.last_name_ar,
            full_name_en: data.full_name_en,
            full_name_ar: data.full_name_ar,
            ssn: data.ssn,
            job_en: data.job_en,
            job_ar: data.job_ar,
            status: data.status,
            image: data.image,
            user_type: role,
            contacts: {
                phones: data.contacts?.phones?.filter(p => p && p.trim() !== '') || [],
                mobiles: data.contacts?.mobiles?.filter(m => m && m.trim() !== '') || []
            },

            university: data.university?.id || null,
            domain: data.domain?.id || null,
            ...(!profileEditMode ? { permission_profile: data.permission_profile?.id || null } : {}),

            departments: data.departments?.map(item => item.id),
        };

        if (!profileEditMode && data.email && data.email.trim() !== "") {
            payload.email = data.email;
        }
        if (!profileEditMode && data.password && data.password.trim() !== "") {
            payload.password = data.password ;
        } else if (isEdit) {
            delete payload.password;
        }

        return payload;
    };

    const handleSubmit = useCallback(
        //FIXME : fix this Render warning properly
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
        async (finalStepData: Record<string, any>) => {
            const finalData: UserFormData = { ...formData, ...finalStepData };

            const cleanedPayload = cleanPayload(finalData);

            const formPayload = new FormData();

            Object.entries(cleanedPayload).forEach(([key, val]) => {
                if (key === "image") {
                    if (typeof val === "string") {
                        formPayload.append(key, "");
                    } else if (val instanceof File) {
                        formPayload.append(key, finalData.image);
                    }
                }
                else if (key === "contacts") {
                    formPayload.append("contacts", JSON.stringify(val));
                }
                else if (Array.isArray(val)) {
                    formPayload.append(key, JSON.stringify(val));
                }
                else if (val !== null && val !== undefined) {
                    formPayload.append(key, val as string);
                }
            });

            try {
                setSubmitErrors([]);
                await addOrEditMutation.mutateAsync(formPayload);
                message.success(t(userData ? "user_list.edit_success" : "user_list.add_success"));
                resetModalState();
            } catch (error: any) {
                const backendFieldErrors = getApiFieldErrors(error)
                    .map((item: { message?: string }) => item?.message)
                    .filter((item: string | undefined): item is string => Boolean(item?.trim()));
                const fallbackMessage = getErrorMessage(error, t("user_list.submit_error"));
                const combinedErrors = Array.from(
                    new Set([fallbackMessage, ...backendFieldErrors].filter(Boolean)),
                );

                setSubmitErrors(combinedErrors);
                message.error(combinedErrors[0] || t("user_list.submit_error"));
            }
        },

        [formData, userData, addOrEditMutation, t]
    );

    const steps = [
        { title: t("user_list.info_title"), component: StepInfo },
        { title: t("user_list.contacts_title"), component: StepContacts },
        { title: t("user_list.jobLocation_title"), component: StepJobLocation },
        ...(!profileEditMode
            ? [
                { title: t("user_list.perm_title"), component: StepPermissions },
                { title: t("user_list.access_title"), component: StepAccess },
            ]
            : []),
    ];

    const CurrentStepComponent = steps[current].component as any;
    const isLastStep = current === steps.length - 1;

    // const handleTriggerSubmit = useCallback((trigger: () => void) => setStepSubmitTrigger(() => trigger), []);

    const stepItems = useMemo(() => steps.map(item => ({
        key: item.title,
        title: item.title,
    })), [t, steps]);

    return (
        <Modal
            key={resetKey}
            title={t(userData ? "user_list.edit_user" : "user_list.add_user")}
            open={isVisible}
            onCancel={handleConfirmClose}
            maskClosable={false}
            footer={null}
            width="85vw"
            style={{ top: 20 }}
        >
            <Spin spinning={isModalLoading}>
                <Steps current={current} style={{ marginBottom: 24 }} items={stepItems} onChange={handleStepChange} />

                {!!submitErrors.length && (
                    <Alert
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message={submitErrors[0]}
                        description={
                            submitErrors.length > 1 ? (
                                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                                    {submitErrors.slice(1).map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : null
                        }
                    />
                )}

                <div className="steps-content">
                    <CurrentStepComponent
                        ref={currentStepRef}
                        initialData={formData}
                        onNext={isLastStep ? handleSubmit : next}
                        onSubmit={handleSubmit}
                        isSubmitting={addOrEditMutation.isPending}
                    // onTriggerSubmit={handleTriggerSubmit}
                    />
                </div>

                <div className="steps-action" style={{ marginTop: 24 }}>
                    <Flex gap="middle">
                        {current > 0 && (
                            <Button
                                size="large"
                                onClick={prev}
                                disabled={addOrEditMutation.isPending}
                                style={{ flex: 1 }} // Takes 50% if another button exists, 100% if alone
                            >
                                {t("user_list.previous")}
                            </Button>
                        )}

                        {!isLastStep ? (
                            <Button
                                form="step-form"
                                type="primary"
                                size="large"
                                htmlType="submit"
                                disabled={addOrEditMutation.isPending}
                                style={{ flex: 1 }} // Automatically takes remaining space
                            >
                                {t("user_list.next")}
                            </Button>
                        ) : (
                            <Button
                                form="step-form"
                                htmlType="submit"
                                type="primary"
                                size="large"
                                loading={addOrEditMutation.isPending}
                                style={{ flex: 1 }}
                            // onClick={() => {
                            //     if (stepSubmitTrigger) stepSubmitTrigger();
                            // }}
                            >
                                {t("user_list.submit")}
                            </Button>
                        )}
                    </Flex>
                </div>
            </Spin>
        </Modal>
    );
};

export default UserFormModal;
