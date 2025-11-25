import React, { useEffect } from "react";
import { Form, Card, Flex, Select, Input } from "antd";
import { Controller, useForm } from "react-hook-form";



import { useTranslation } from "react-i18next";
import type { UserFormData } from "../../Types/users";
import { useDepartments, useDomains, useUniversities } from "../../Hooks/useUsers";
import RequiredTag from "../../../../components/RequiredTag";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepJobLocation: React.FC<Props> = ({ initialData, onNext }) => {
    const { handleSubmit, control, formState: { errors }, reset } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });
    useEffect(() => { reset(initialData); }, [initialData, reset]);

    const { t } = useTranslation();
    
    const { data: universities, isLoading: uniLoading } = useUniversities();
    const { data: domains, isLoading: domainLoading } = useDomains();
    const { data: departments, isLoading: depLoading } = useDepartments();

    const onSubmit = (data: UserFormData) => {
        onNext({
            job: data.job,
            university: data.university,
            domain: data.domain,
            departments: data.departments,
        });
    };

    return (
        <Card title= {t("user_list.job_location")}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.job_title")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.job ? "error" : ""} help={errors.job?.message} required>
                    <Controller name="job" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => <Input {...field} className="ant-input" />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.university")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.university ? "error" : ""} help={errors.university?.message} required>
                    <Controller name="university" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                loading={uniLoading}
                                showSearch
                                options={universities?.map(u => ({ value: u.id, label: u.name }))}
                                value={field.value?.id}
                                onChange={(id) => {
                                    const selected = universities?.find(u => u.id === id) ?? null;
                                    field.onChange(selected);
                                }}
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.domain")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.domain ? "error" : ""} help={errors.domain?.message} required>
                    <Controller name="domain" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                loading={domainLoading}
                                showSearch
                                options={domains?.map(d => ({ value: d.id, label: d.name }))}
                                value={field.value?.id}
                                onChange={(id) => {
                                    const selected = domains?.find(d => d.id === id) ?? null;
                                    field.onChange(selected);
                                }}
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.department")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.departments ? "error" : ""} help={errors.departments?.message} required>
                    <Controller name="departments" control={control}
                        rules={{ required: "Required", validate: val => Array.isArray(val) && val.length > 0 || "Required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                mode="multiple"
                                loading={depLoading}
                                options={departments?.map(d => ({ value: d.id, label: d.name }))}
                                value={field.value?.map(d => d.id)}
                                onChange={(ids: string[]) => {
                                    const selected = departments?.filter(dep => ids.includes(dep.id)) || [];
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
export default StepJobLocation;
