import React, { useEffect, useMemo } from "react";
import { Form, Card, Flex, Select, Typography, TreeSelect } from "antd";
import { Controller, useForm } from "react-hook-form";
import type { UserFormData } from "../../Types/users";
import { usePermissionProfiles, useSpecializations } from "../../Hooks/useUsers";
import RequiredTag from "../../../../components/RequiredTag";
import { useTranslation } from "react-i18next";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepPermissions: React.FC<Props> = ({ initialData, onNext }) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const { handleSubmit, control, formState: { errors }, reset } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });
    useEffect(() => { reset(initialData); }, [initialData, reset]);

    const { data: profiles, isLoading: profilesLoading } = usePermissionProfiles();
    const { data: specializations, isLoading: specsLoading } = useSpecializations();

    const treeData = useMemo(() => {
        return profiles?.map(profile => ({
            title: (
                <Typography.Text 
                    strong 
                    style={{ cursor: 'pointer', display: 'block', width: '100%' }}
                >
                    {isAr ? profile.name_ar : profile.name_en}
                </Typography.Text>
            ),
            value: `profile-${profile.id}`, 
            checkable: false,
            selectable: false,
            children: profile.permissions?.map(perm => ({
                title: isAr ? perm.name_ar : perm.name_en,
                value: `${profile.id}|${perm.key}`,
            })) || []
        })) || [];
    }, [profiles, isAr]);

    const onSubmit = (data: UserFormData) => {
        onNext({
            permission_profile: data.permission_profile,
            specializations: data.specializations,
        });
    };
    const filterOption = (input: string, option: { value: string; label: string } | undefined) => {
        if (!option || !option.label) return false;

        return option.label.toLowerCase().includes(input.toLowerCase());
    };

    return (
        <Card title={t("user_list.perms")}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item
                    label={<Flex gap="small"><span>{t("user_list.permissions")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.permission_profile ? "error" : ""}
                    help={errors.permission_profile?.message}
                    required
                >
                    <Controller
                        name="permission_profile"
                        control={control}
                        rules={{ required: t("common.required") }}
                        render={({ field }) => (
                            <TreeSelect
                                {...field}
                                treeData={treeData}
                                treeCheckable={true}
                                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                treeExpandAction="click"
                                style={{ width: '100%' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                multiple
                                allowClear
                                treeDefaultExpandAll={false}
                                loading={profilesLoading}
                            />
                        )}
                    />
                </Form.Item>
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
