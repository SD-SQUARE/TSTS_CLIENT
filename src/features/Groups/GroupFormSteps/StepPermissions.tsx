import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import {  useEffect } from "react";
import React from "react";
import { Card, Flex, Form, Select } from "antd";
import type { GroupFormData } from "../Types/groups";
import { useSpecializations } from "../Hooks/useGroupForm";
import RequiredTag from "../../../components/RequiredTag";


interface StepProps {
    initialData: GroupFormData;
    onSubmit: (data: Partial<GroupFormData>) => void;
    isSubmitting: boolean;
    // onTriggerSubmit: (submitTrigger: () => void) => void;
}

const StepPermissions: React.FC<StepProps> = ({ initialData, onSubmit, isSubmitting }) => {
    const { t } = useTranslation();
    const { data: specializations, isLoading: isLoadingSpecs } = useSpecializations();


const { handleSubmit,  control, formState: { errors }, reset } = useForm<GroupFormData>({
    defaultValues: initialData,
    mode: 'onChange',
});

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);


    // const submitTrigger = useCallback(() => {
    //     handleSubmit((data) => onSubmit(data))();
    // }, [handleSubmit, onSubmit]);


    // React.useEffect(() => {
    //     onTriggerSubmit(submitTrigger);
    // }, [submitTrigger, onTriggerSubmit]);

    const localHandleSubmit = () => {
        handleSubmit((data) => onSubmit(data))();
    }

    const mapToAntdOptions = (data) =>
        data?.map((item) => ({ value: item.id, label: item.name })) ?? [];

    const transformAntdValue = (selectedIds, allSpecs) =>
        selectedIds.map((id) => ({
            id,
            name: allSpecs?.find((opt) => opt.id === id)?.name ?? "",
        }));

        const filterOption = (input: string, option: { value: string; label: string } | undefined) => {
            if (!option || !option.label) return false;
            
            return option.label.toLowerCase().includes(input.toLowerCase());
        };

    return (
        <Card title={t('group_form.step_permissions_card_title')}>
            <Form layout="vertical" id="step-form" requiredMark={false} onFinish={localHandleSubmit}>
                <Form.Item
                    label={
                        <Flex align="start" gap="small">
                            <span>{t("translation.specializations")}</span>
                            <RequiredTag />
                        </Flex>
                    }
                    validateStatus={errors.specializations ? "error" : ""}
                    help={errors.specializations?.message}
                >
                    <Controller
                        name="specializations"
                        control={control}
                        rules={{
                            required: t("required"),
                            validate: (value) =>
                                (value && value.length > 0) || t("required"),
                        }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                mode="multiple"
                                options={mapToAntdOptions(specializations)}
                                loading={isLoadingSpecs}
                                disabled={isSubmitting}
                                showSearch
                                filterOption={filterOption}
                                value={field.value?.map((s) => s.id) ?? []}
                                onChange={(ids) => {
                                    field.onChange(
                                        transformAntdValue(ids, specializations)
                                    );
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