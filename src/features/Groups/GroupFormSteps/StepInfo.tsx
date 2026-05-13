
import React, { useEffect } from 'react';
import { Form, Input, Card, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { Controller, useForm } from 'react-hook-form';
import type { GroupFormData } from '../Types/groups';
import RequiredTag from '../../../components/RequiredTag';
import { ARABIC_TEXT_PATTERN, ENGLISH_TEXT_PATTERN } from '../../../utils/validationPatterns';


interface ApiErrorField {
    field: string;
    message: string;
}

interface StepProps {
    initialData: GroupFormData;
    onNext: (data: Partial<GroupFormData>) => void;
    apiErrors?: ApiErrorField[];
}

const StepInfo: React.FC<StepProps> = ({ initialData, onNext, apiErrors }) => {
    const { t } = useTranslation();

    const { handleSubmit, control, formState: { errors }, reset, setError } = useForm<GroupFormData>({
        defaultValues: initialData,
        mode: 'onChange',
    });

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    useEffect(() => {
        if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach(err => {
                setError(
                    err.field as keyof GroupFormData,
                    {
                        type: 'server',
                        message: err.message
                    },
                    { shouldFocus: true }
                );
            });
        }
    }, [apiErrors, setError]);


    const onSubmit = (data: GroupFormData) => {

        onNext({
            name_ar: data.name_ar,
            name_en: data.name_en,
            description_ar: data.description_ar,
            description_en: data.description_en,
        });
    };

    return (
        <Card title={t('group_form.step_info_card_title')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.name_ar')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.name_ar ? 'error' : ''} help={errors.name_ar?.message} required>
                    <Controller
                        name="name_ar"
                        control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ARABIC_TEXT_PATTERN,
                                message: t("arabic_only"),
                            }
                        }}
                        render={({ field }) => (

                            <Input {...field} />
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.description_ar')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.description_ar ? 'error' : ''} help={errors.description_ar?.message} required>
                    <Controller
                        name="description_ar"
                        control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ARABIC_TEXT_PATTERN,
                                message: t("arabic_only"),
                            }
                        }}
                        render={({ field }) => <Input.TextArea rows={4} {...field} />}
                    />                </Form.Item>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.name_en')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.name_en ? 'error' : ''} help={errors.name_en?.message} required>
                    <Controller
                        name="name_en"
                        control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ENGLISH_TEXT_PATTERN,
                                message: t("english_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} />}
                    />                </Form.Item>

                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.description_en')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.description_en ? 'error' : ''} help={errors.description_en?.message} required>
                    <Controller
                        name="description_en"
                        control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ENGLISH_TEXT_PATTERN,
                                message: t("english_only"),
                            }
                        }}
                        render={({ field }) => <Input.TextArea rows={4} {...field} />}
                    />                </Form.Item>
            </Form>
        </Card>
    );
};

export default StepInfo;
