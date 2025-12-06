/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef } from "react";
import { Form, Card, Flex, Input, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useForm, useFieldArray } from "react-hook-form";

import { t } from "i18next";
import type { UserFormData } from "../../Types/users";
import RequiredTag from "../../../../components/RequiredTag";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepContacts: React.FC<Props> = ({ initialData, onNext }) => {

    const isInitialLoad = useRef(true);

    const { handleSubmit, control, formState: { errors }, reset } =
        useForm<UserFormData>({
            defaultValues: {
                ...initialData,
                contacts: { phones: initialData.contacts?.phones ?? [], mobiles: initialData.contacts?.mobiles ?? [] },
            },
            mode: "onChange"
        });

    useEffect(() => {
        reset({
            ...initialData,
            contacts: {
                phones: initialData.contacts?.phones ?? [],
                mobiles: initialData.contacts?.mobiles ?? [],
            }
        });
    }, [initialData, reset]);



    const phonesField = useFieldArray<UserFormData, any>({ control, name: "contacts.phones" });
    const mobilesField = useFieldArray<UserFormData, any>({ control, name: "contacts.mobiles" });

    useEffect(() => {
        if (isInitialLoad.current) {
            if (phonesField.fields.length === 0) {
                phonesField.append("");
            }
            if (mobilesField.fields.length === 0) {
                mobilesField.append("");
            }
            isInitialLoad.current = false;
        }
    }, [phonesField, mobilesField]);


    const onSubmit = (data: UserFormData) => {
        const cleanPhones = data.contacts?.phones.filter(p => p && p.trim() !== '');
        const cleanMobiles = data.contacts?.mobiles.filter(m => m && m.trim() !== '');

        onNext({ contacts: { phones: cleanPhones, mobiles: cleanMobiles } });
    };

    return (
        <Card title={t('user_list.contact_info')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>

                <Form.Item label={<Flex gap="small"><span>{t('user_list.phone')}</span><RequiredTag /></Flex>}>

                    {phonesField.fields.map((field, idx) => (
                        <Flex gap="small" key={field.id} style={{ marginBottom: 8, alignItems: 'start' }}>
                            <Form.Item
                                validateStatus={errors.contacts?.phones?.[idx] ? 'error' : ''}
                                help={errors.contacts?.phones?.[idx]?.message}
                                style={{ margin: 0 }}
                            >
                                <Controller
                                    name={`contacts.phones.${idx}`}
                                    control={control}
                                    rules={{ required: t('required') }}

                                    render={({ field: controllerField }) => (
                                        <Input  {...controllerField} style={{ width: 250 }} />
                                    )}
                                />
                            </Form.Item>

                            {phonesField.fields.length > 1 && <MinusCircleOutlined
                                onClick={() => phonesField.remove(idx)}
                                style={{ cursor: 'pointer', marginTop: 10 }}
                                disabled={phonesField.fields.length === 1}
                            />}
                            
                        </Flex>
                    ))}

                    <Button
                        type="dashed"
                        onClick={() => phonesField.append("")}
                        block
                        style={{ width: 250, marginTop: 10 }}
                        icon={<PlusOutlined />}
                    >
                        {t('user_list.add_phone')}
                    </Button>
                </Form.Item>


                <Form.Item label={<Flex gap="small"><span>{t('user_list.mobile')}</span><RequiredTag /></Flex>}>
                    {mobilesField.fields.map((field, idx) => (
                        <Flex gap="small" key={field.id} style={{ marginBottom: 8, alignItems: 'start' }}>
                            <Form.Item
                                validateStatus={errors.contacts?.mobiles?.[idx] ? 'error' : ''}
                                help={errors.contacts?.mobiles?.[idx]?.message}
                                style={{ margin: 0 }}
                            >
                                <Controller
                                    name={`contacts.mobiles.${idx}`}
                                    control={control}
                                    rules={{ required: t('required') }}
                                    render={({ field: controllerField }) => (
                                        <Input {...controllerField} style={{ width: 250 }} />
                                    )}
                                />
                            </Form.Item>

                            {mobilesField.fields.length > 1  && <MinusCircleOutlined
                                onClick={() => mobilesField.remove(idx)}
                                style={{ cursor: 'pointer', marginTop: 10 }}
                                disabled={mobilesField.fields.length === 1}
                            />}
                            
                        </Flex>
                    ))}

                    <Button
                        type="dashed"
                        onClick={() => mobilesField.append("")}
                        block
                        style={{ width: 250, marginTop: 10 }}
                        icon={<PlusOutlined />}
                    >
                        {t('user_list.add_mobile')}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
export default StepContacts;