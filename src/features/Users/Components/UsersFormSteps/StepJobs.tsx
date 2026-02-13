import React, { useEffect } from "react";
import { Form, Card, Flex, Select, Input } from "antd";
import { Controller, useForm } from "react-hook-form";



import { useTranslation } from "react-i18next";
import type { Lookup, UserFormData } from "../../Types/users";
import { useDepartments, useDomains, useUniversities } from "../../Hooks/useUsers";
import RequiredTag from "../../../../components/RequiredTag";


const ENGLISH_REGEX = /^[A-Za-z\s.,!?'"()@&$-]+$/;
const ARABIC_REGEX = /^[\u0600-\u06FF\s\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF.,!?'"()@&$-]+$/u;


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepJobLocation: React.FC<Props> = ({ initialData, onNext }) => {
    const { handleSubmit, control, formState: { errors }, reset, watch, setValue } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });
    useEffect(() => { reset(initialData); }, [initialData, reset]);

    const { t } = useTranslation();

    const selectedUniversity = watch('university');
    const selectedDomain = watch('domain');

    const universityId = selectedUniversity?.id;
    const domainId = selectedDomain?.id;

    const { data: universities, isLoading: uniLoading } = useUniversities();
    const { data: domains, isLoading: domainLoading } = useDomains(universityId);
    const { data: departments, isLoading: depLoading } = useDepartments(domainId);

    useEffect(() => {
        if (initialData.university?.id !== universityId) {
            setValue('domain', null, { shouldValidate: true });
            setValue('departments', [], { shouldValidate: true });
        }
    }, [universityId, initialData.university?.id, setValue]);

    useEffect(() => {
        if (initialData.domain?.id !== domainId) {
            setValue('departments', [], { shouldValidate: true });
        }
    }, [domainId, initialData.domain?.id, setValue]);

    const onSubmit = (data: UserFormData) => {
        onNext({
            job_en: data.job_en,
            job_ar: data.job_ar,
            university: data.university,
            domain: data.domain,
            departments: data.departments || [data.domain],
        });
    };

    const filterOption = (input: string, option: { value: string; label: string } | undefined) => {
        if (!option || !option.label) return false;
        return option.label.toLowerCase().includes(input.toLowerCase());
    };

    const mapLookupToOptions = (data: Lookup[] | undefined) => {
        return data?.map(item => ({ value: item.id, label: item.name })) || [];
    };

    return (
        <Card title={t("user_list.job_location")}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.job_title_ar")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.job_ar ? "error" : ""} help={errors.job_ar?.message} required>
                    <Controller name="job_ar" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ARABIC_REGEX,
                                message: t("arabic_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} className="ant-input" />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.job_title_en")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.job_en ? "error" : ""} help={errors.job_en?.message} required>
                    <Controller name="job_en" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ENGLISH_REGEX,
                                message: t("english_only"),
                            }
                        }}
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
                                filterOption={filterOption}
                                options={mapLookupToOptions(universities)}
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
                                disabled={!universityId}
                                loading={domainLoading}
                                showSearch
                                filterOption={filterOption}
                                options={mapLookupToOptions(domains)}
                                value={field.value?.id}
                                onChange={(id) => {
                                    const selected = domains?.find(d => d.id === id) ?? null;
                                    field.onChange(selected);
                                }}
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.department")}</span></Flex>}
                    validateStatus={errors.departments ? "error" : ""} help={errors.departments?.message} required>
                    <Controller name="departments" control={control}
                        rules={{  validate: val => Array.isArray(val) && val.length > 0  }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                disabled={!domainId}
                                mode="multiple"
                                loading={depLoading}
                                showSearch
                                filterOption={filterOption}
                                options={mapLookupToOptions(departments)}
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
