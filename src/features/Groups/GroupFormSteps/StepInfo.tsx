
import React, { useEffect } from 'react';
import { Form, Input, Card, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { Controller, useForm } from 'react-hook-form';
import type { GroupFormData } from '../Types/groups';
import RequiredTag from '../../../components/RequiredTag';



interface StepProps {
    initialData: GroupFormData;
    onNext: (data: Partial<GroupFormData>) => void;

}

const StepInfo: React.FC<StepProps> = ({ initialData, onNext }) => {
    const { t } = useTranslation();

    const { handleSubmit, control, formState: { errors }, reset } = useForm<GroupFormData>({
        defaultValues: initialData,
        mode: 'onChange',
    });

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);



    const onSubmit = (data: GroupFormData) => {

        onNext({
            nameArabic: data.nameArabic,
            nameEnglish: data.nameEnglish,
            descriptionArabic: data.descriptionArabic,
            descriptionEnglish: data.descriptionEnglish,
        });
    };

    return (
        <Card title={t('group_form.step_info_card_title')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.name_ar')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.nameArabic ? 'error' : ''} help={errors.nameArabic?.message} required>
                    <Controller
                        name="nameArabic"
                        control={control}
                        rules={{ required: t('required') }}
                        render={({ field }) => (

                            <Input {...field} />
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.name_en')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.nameEnglish ? 'error' : ''} help={errors.nameEnglish?.message} required>
                    <Controller
                        name="nameEnglish"
                        control={control}
                        rules={{ required: t('required') }}
                        render={({ field }) => <Input {...field} />}
                    />                </Form.Item>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.description_ar')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.descriptionArabic ? 'error' : ''} help={errors.descriptionArabic?.message} required>
                    <Controller
                        name="descriptionArabic"
                        control={control}
                        rules={{ required: t('required') }}
                        render={({ field }) => <Input.TextArea rows={4} {...field} />}
                    />                </Form.Item>
                <Form.Item label={<Flex align="start" gap="small">
                    <span>{t('translation.description_en')}</span>
                    <RequiredTag />
                </Flex>} validateStatus={errors.descriptionEnglish ? 'error' : ''} help={errors.descriptionEnglish?.message} required>
                    <Controller
                        name="descriptionEnglish"
                        control={control}
                        rules={{ required: t('required') }}
                        render={({ field }) => <Input.TextArea rows={4} {...field} />}
                    />                </Form.Item>
            </Form>
        </Card>
    );
};

export default StepInfo;