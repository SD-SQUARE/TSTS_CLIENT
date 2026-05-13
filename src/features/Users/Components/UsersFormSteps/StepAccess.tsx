import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Form, Card, Flex, Input } from "antd";
import { Controller, useForm } from "react-hook-form";


import { t } from "i18next";
import type { UserFormData } from "../../Types/users";
import RequiredTag from "../../../../components/RequiredTag";
import type { UserFormStepHandle } from "./types";
import { useAllowedEmailDomains } from "../../../site-settings/hooks/useSiteSettings";


interface Props {
    initialData: UserFormData;
    onSubmit: (data: Partial<UserFormData>) => void;
    isSubmitting: boolean;
    // onTriggerSubmit: (submitTrigger: () => void) => void;
}

const StepAccess = forwardRef<UserFormStepHandle, Props>(({
    initialData,
    onSubmit,
    isSubmitting,
    // onTriggerSubmit,
}, ref) => {
    const { handleSubmit, control, formState: { errors }, reset, getValues } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });

        const isEdit = !!initialData?.email;
    const { data: allowedDomains = [] } = useAllowedEmailDomains();
    const allowedDomainNames = useMemo(
        () => allowedDomains.map((item) => item.domain.toLowerCase()),
        [allowedDomains],
    );

    useEffect(() => { reset(initialData); }, [initialData, reset]);

    // const submitTrigger = useCallback(() => {
    //     handleSubmit((data) => {
    //         return onSubmit(data);
    //     })();
    // }, [handleSubmit, onSubmit]);


    // React.useEffect(() => {
    //     onTriggerSubmit(submitTrigger);
    // }, [submitTrigger, onTriggerSubmit]);

    const localHandleSubmit = () => {
        handleSubmit((data) => onSubmit(data))();
    }

    useImperativeHandle(ref, () => ({
        getValues: () => {
            const data = getValues();
            return {
                email: data.email,
                password: data.password,
            };
        },
    }), [getValues]);

    return (
        <Card title={t("user_list.user_access")}>
            <Form layout="vertical" id="step-form" requiredMark={false} onFinish={localHandleSubmit}>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.email")}</span>{!isEdit && <RequiredTag />}</Flex>}
                    validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
                    <Controller name="email" control={control}
                        rules={{
                            // required: isEdit ? false : t("required"),
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("Invalid_email_address_format") },
                            validate: (value) => {
                                if (!value || allowedDomainNames.length === 0) return true;
                                const domain = value.split("@").pop()?.toLowerCase();
                                return (
                                    (domain && allowedDomainNames.includes(domain)) ||
                                    t("siteSettings.emailDomainNotAllowed", {
                                        domains: allowedDomainNames.join(", "),
                                    })
                                );
                            },
                        }}
                        render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.password")}</span>{!isEdit && <RequiredTag />}</Flex>}
                    validateStatus={errors.password ? "error" : ""} help={errors.password?.message} >
                    <Controller name="password" control={control} disabled={isSubmitting}
                        rules={{
                            // required:isEdit ? false : t("required"),
                            minLength: isEdit ? {
                                value: 8,
                                message: t("password_8_chars"),
                            } : {
                                value: 8,
                                message: t("password_8_chars"),
                            },
                            validate: {
                                hasUpperCase: (v) => !v || /[A-Z]/.test(v) || t("password_uppercase"),
                                hasNumber: (v) => !v || /[0-9]/.test(v) || t("password_number"),
                                hasSpecialChar: (v) => !v || /[^A-Za-z0-9\s]/.test(v) || t("password_special"),
                                hasLowerCase: (v) => !v || /[a-z]/.test(v) || t("password_lowercase"),
                            },
                        }}
                        render={({ field }) => <Input.Password {...field} />} />
                </Form.Item>
            </Form>
        </Card>
    );
});

StepAccess.displayName = "StepAccess";

export default StepAccess;
