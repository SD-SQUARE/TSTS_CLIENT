/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from "react";
import { Modal, Steps, Button, Space, message, Spin } from "antd";
import { useTranslation } from "react-i18next";

import StepInfo from "./UsersFormSteps/StepInfo";
import StepContacts from "./UsersFormSteps/StepContacts";
import StepJobLocation from "./UsersFormSteps/StepJobs";
import StepPermissions from "./UsersFormSteps/StepPermissions";
import StepAccess from "./UsersFormSteps/StepAccess";
import { t } from "i18next";
import type { UserFormData, UserListItem, UserPayload } from "../Types/users";
import { useAddOrEditUser, useUserDetail } from "../Hooks/useUsers";



const steps = [
    { title: t("user_list.info_title"), component: StepInfo },
    { title: t("user_list.contacts_title"), component: StepContacts },
    { title: t("user_list.jobLocation_title"), component: StepJobLocation },
    { title: t("user_list.perm_title"), component: StepPermissions },
    { title: t("user_list.access_title"), component: StepAccess },
];

const initialFormData: UserFormData = {
    image: null,
    first_name_en: "",
    first_name_ar: "",
    mid_name_en: "",
    mid_name_ar: "",
    last_name_en: "",
    last_name_ar: "",
    ssn: "",
    contacts: { phones: [""], mobiles: [""] },
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
};

const UserFormModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    userData?: UserListItem;
    role: string;
}> = ({ isVisible, onClose, userData, role }) => {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    // const [stepSubmitTrigger, setStepSubmitTrigger] = useState<(() => void) | null>(null);

    const { data: fetchedUserDetail, isLoading: isFetchingDetail } = useUserDetail(role, userData?.id);
    const isModalLoading = isFetchingDetail; 
    useEffect(() => {

        if(!isVisible){
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrent(0);
            setFormData(initialFormData);
            return;
        }
        if (userData) {
            //FIXME : fix this Render warning properly
            if(fetchedUserDetail) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData({
                    image: fetchedUserDetail.image,
                    first_name_en: fetchedUserDetail.first_name_en,
                    first_name_ar: fetchedUserDetail.first_name_ar,
                    mid_name_en: fetchedUserDetail.mid_name_en,
                    mid_name_ar: fetchedUserDetail.mid_name_ar,
                    last_name_en: fetchedUserDetail.last_name_en,
                    last_name_ar: fetchedUserDetail.last_name_ar,
                    ssn: fetchedUserDetail.ssn,
                    contacts: { phones: fetchedUserDetail.contacts.phones, mobiles: fetchedUserDetail.contacts.mobiles },
                    job_en: fetchedUserDetail.job_en,
                    job_ar: fetchedUserDetail.job_ar,
                    university: fetchedUserDetail.university ?? null,
                    domain: fetchedUserDetail.domain ?? null,
                    departments: fetchedUserDetail.departments ?? [],
                    permission_profile: fetchedUserDetail.permission_profile ?? null,
                    specializations: fetchedUserDetail.specializations ?? [],
                    email: fetchedUserDetail.email,
                    password: "",
                    status: fetchedUserDetail.status,
                });
                setCurrent(0);
            }
        } else{
            setFormData(initialFormData);
            setCurrent(0);
        }
    }, [userData, isVisible, fetchedUserDetail]);

    const addOrEditMutation = useAddOrEditUser(role, userData?.id);

    const resetModalState = () => {
        setCurrent(0);
        setFormData(initialFormData);
        // setStepSubmitTrigger(null);
        onClose();
    };

    const next = (data: Partial<UserFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
        setCurrent(current + 1);
    };
    const prev = () => setCurrent(current - 1);

    const cleanPayload = (data: UserFormData) => {

        const payload: Partial<UserPayload> = {
            first_name_en: data.first_name_en,
            first_name_ar: data.first_name_ar,
            mid_name_en: data.mid_name_en,
            mid_name_ar: data.mid_name_ar,
            last_name_en: data.last_name_en,
            last_name_ar: data.last_name_ar,
            ssn: data.ssn,
            job_en: data.job_en,
            job_ar: data.job_ar,
            email: data.email,
            password: data.password,
            status: data.status,
            image: data.image,

            contacts: data.contacts,

            university: data.university?.id || null,
            domain: data.domain?.id || null,
            permission_profile: data.permission_profile?.id || null,

            departments: data.departments.map(item => item.id),
            specializations: data.specializations.map(item => item.id),
        };

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
                if (key === "image" && finalData.image instanceof File) {
                    formPayload.append(key, finalData.image);
                }
                else if (key === "contacts") {
                    if (typeof val === "object" && val !== null && "phones" in val) {
                        formPayload.append("phones", JSON.stringify(val.phones));
                    }
                    if (typeof val === "object" && val !== null && "mobiles" in val) {
                        formPayload.append("mobiles", JSON.stringify(val.mobiles));
                    }
                }
                else if (Array.isArray(val)) {
                    formPayload.append(key, JSON.stringify(val));
                }
                else if (val !== null && val !== undefined) {
                    formPayload.append(key, val as string);
                }
            });

            try {
                // console.log(cleanedPayload);
                await addOrEditMutation.mutateAsync(formPayload);
                message.success(t(userData ? "user_list.edit_success" : "user_list.add_success"));
                resetModalState();
            } catch (error: any) {
                console.error("Submission Error:", error);
                message.error(t("user_list.submit_error"));
            }
        },
        
        [formData, userData, addOrEditMutation, t]
    );

    const CurrentStepComponent = steps[current].component;
    const isLastStep = current === steps.length - 1;

    // const handleTriggerSubmit = useCallback((trigger: () => void) => setStepSubmitTrigger(() => trigger), []);



    return (
        <Modal
            title={t(userData ? "user_list.edit_user" : "user_list.add_user")}
            open={isVisible}
            onCancel={resetModalState}
            footer={null}
            width={750}
            destroyOnHidden
        >
            <Spin spinning={isModalLoading}>
            <Steps current={current} style={{ marginBottom: 24 }}>
                {steps.map(item => (
                    <Steps.Step key={item.title} title={t(item.title)} />
                ))}
            </Steps>

            <div className="steps-content">
                <CurrentStepComponent
                    initialData={formData}
                    onNext={next}
                    onSubmit={handleSubmit}
                    isSubmitting={addOrEditMutation.isPending}
                    // onTriggerSubmit={handleTriggerSubmit}
                />
            </div>

            <div className="steps-action" style={{ marginTop: 24, textAlign: "right" }}>
                <Space>
                    {current > 0 && (
                        <Button onClick={prev} disabled={addOrEditMutation.isPending}>{t("user_list.previous")}</Button>
                    )}
                    {!isLastStep && (
                        <Button form="step-form" type="primary" htmlType="submit" disabled={addOrEditMutation.isPending}>
                            {t("user_list.next")}
                        </Button>
                    )}
                    {isLastStep && (
                        <Button form="step-form" htmlType="submit" type="primary" loading={addOrEditMutation.isPending}
                            // onClick={() => {
                            //     if (stepSubmitTrigger) stepSubmitTrigger();
                            // }}
                            >
                            {t("user_list.submit")}
                        </Button>
                    )}
                </Space>
            </div>
            </Spin>
        </Modal>
    );
};

export default UserFormModal;
