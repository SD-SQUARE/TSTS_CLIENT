import React, { useEffect } from "react";
import { Form, Card, Flex, Select } from "antd";
import { Controller, useForm } from "react-hook-form";

import { t } from "i18next";
import type { UserFormData } from "../../Types/users";
import { usePermissionProfiles, useSpecializations } from "../../Hooks/useUsers";
import RequiredTag from "../../../../components/RequiredTag";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepPermissions: React.FC<Props> = ({ initialData, onNext }) => {
    const { handleSubmit, control, formState: { errors }, reset } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });
    useEffect(() => { reset(initialData); }, [initialData, reset]);

    // const { data: profiles, isLoading: profilesLoading } = usePermissionProfiles();
    const { data: specializations, isLoading: specsLoading } = useSpecializations();

    const onSubmit = (data: UserFormData) => {
        onNext({
            // permission_profile: data.permission_profile,
            specializations: data.specializations,
        });
    };
    const filterOption = (input: string, option: { value: string; label: string } | undefined) => {
        if (!option || !option.label) return false;
        
        return option.label.toLowerCase().includes(input.toLowerCase());
    };

    return (
        <Card title= {t("user_list.perms")}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                {/* <Form.Item label={<Flex gap="small"><span>{t("user_list.perm_prof")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.permission_profile ? "error" : ""} help={errors.permission_profile?.message} required>
                    <Controller name="permission_profile" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                loading={profilesLoading}
                                showSearch
                                filterOption={filterOption}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                options={profiles?.map(p => ({ value: p.id, label: (p as any).name_en }))}

                                value={field.value?.id}
                                onChange={(id) => {
                                    const selected = profiles?.find(p => p.id === id) ?? null;
                                    field.onChange(selected);
                                }}
                            />
                        )}
                    />
                </Form.Item> */}
                <Form.Item label={<Flex gap="small"><span>{t("user_list.specializations")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.specializations ? "error" : ""} help={errors.specializations?.message} required>
                    <Controller name="specializations" control={control}
                        rules={{ required: "Required", validate: val => Array.isArray(val) && val.length > 0 || "Required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                mode="multiple"
                                loading={specsLoading}
                                showSearch
                                filterOption={filterOption}
                                options={specializations?.map(s => ({ value: s.id, label: s.name }))}
                                value={field.value?.map(s => s.id)}
                                onChange={(ids: string[]) => {
                                    const selected = specializations?.filter(s => ids.includes(s.id)) || [];
                                    field.onChange(selected);
                                }}
                            />
                        )}
                    />
                </Form.Item>
            </Form>
        </Card>
    );
};
export default StepPermissions;
