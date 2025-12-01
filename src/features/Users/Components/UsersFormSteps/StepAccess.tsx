import React, { useCallback, useEffect } from "react";
import { Form, Card, Flex, Input } from "antd";
import { Controller, useForm } from "react-hook-form";


import { t } from "i18next";
import type { UserFormData } from "../../Types/users";
import RequiredTag from "../../../../components/RequiredTag";


interface Props {
    initialData: UserFormData;
    onSubmit: (data: Partial<UserFormData>) => void;
    isSubmitting: boolean;
    onTriggerSubmit: (submitTrigger: () => void) => void;
}

const StepAccess: React.FC<Props> = ({
    initialData,
    onSubmit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSubmitting,
    onTriggerSubmit,
}) => {
    const { handleSubmit, control, formState: { errors }, reset } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });

    useEffect(() => { reset(initialData); }, [initialData, reset]);

    const submitTrigger = useCallback(() => {
        handleSubmit((data) => {
            return onSubmit(data);
        })();
    }, [handleSubmit, onSubmit]);


    React.useEffect(() => {
        onTriggerSubmit(submitTrigger);
    }, [submitTrigger, onTriggerSubmit]);
    return (
        <Card title={t("user_list.user_access")}>
            <Form layout="vertical" id="step-form" requiredMark={false}>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.email")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.email ? "error" : ""} help={errors.email?.message} required>
                    <Controller name="email" control={control}
                        rules={{
                            required: "Required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                        }}
                        render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.password")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.password ? "error" : ""} help={errors.password?.message} required>
                    <Controller name="password" control={control}
                        rules={{
                            required: "Required",
                            minLength: { value: 6, message: "At least 6 chars" },
                            validate: v => /[A-Z]/.test(v) && /[0-9]/.test(v) || "Must use A-Z and 0-9",
                        }}
                        render={({ field }) => <Input.Password {...field} />} />
                </Form.Item>
            </Form>
        </Card>
    );
};
export default StepAccess;
