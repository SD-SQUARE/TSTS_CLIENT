import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Form, Card, Flex, Select } from "antd";
import { Controller, useForm } from "react-hook-form";

import { t } from "i18next";
import type { UserFormData } from "../../Types/users";
import { usePermissionProfiles } from "../../Hooks/useUsers";
import RequiredTag from "../../../../components/RequiredTag";
import type { UserFormStepHandle } from "./types";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepPermissions = forwardRef<UserFormStepHandle, Props>(({ initialData, onNext }, ref) => {
    const { handleSubmit, control, formState: { errors }, reset, getValues } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });
    useEffect(() => { reset(initialData); }, [initialData, reset]);

    const { data: profiles, isLoading: profilesLoading } = usePermissionProfiles();

    const onSubmit = (data: UserFormData) => {
        onNext({
            permission_profile: data.permission_profile,
        });
    };

    useImperativeHandle(ref, () => ({
        getValues: () => {
            const data = getValues();
            return {
                permission_profile: data.permission_profile,
            };
        },
    }), [getValues]);
    const filterOption = (input: string, option: { value: string; label: string } | undefined) => {
        if (!option || !option.label) return false;
        
        return option.label.toLowerCase().includes(input.toLowerCase());
    };

    return (
        <Card title= {t("user_list.perms")}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.perm_prof")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.permission_profile ? "error" : ""} help={errors.permission_profile?.message} required>
                    <Controller name="permission_profile" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                loading={profilesLoading}
                                showSearch
                                filterOption={filterOption}
                                options={profiles?.map((profile) => ({
                                    value: profile.id,
                                    label: profile.name_en,
                                }))}

                                value={field.value?.id}
                                onChange={(id) => {
                                    const selected = profiles?.find(p => p.id === id) ?? null;
                                    field.onChange(selected);
                                }}
                            />
                        )}
                    />
                </Form.Item>
                {/* Specialization assignment is intentionally managed outside the user create/edit modal. */}
            </Form>
        </Card>
    );
});

StepPermissions.displayName = "StepPermissions";

export default StepPermissions;
