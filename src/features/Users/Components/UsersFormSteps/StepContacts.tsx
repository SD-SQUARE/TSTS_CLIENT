/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/UserFormSteps/StepContacts.tsx
import React, { useEffect, useRef } from "react";
import { Form, Card, Flex, Input, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useForm, useFieldArray } from "react-hook-form";

import { t } from "i18next"; // Assuming t is correctly imported from i18next
import type { UserFormData } from "../../Types/users";
import RequiredTag from "../../../../components/RequiredTag";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepContacts: React.FC<Props> = ({ initialData, onNext }) => {

    // 1. DEFINE isInitialLoad HERE
    const isInitialLoad = useRef(true);
    // console.log(initialData);

    const { handleSubmit, control, formState: { errors }, reset } =
        useForm<UserFormData>({
            // Ensure all initial data fields are spread, safely defaulting arrays
            defaultValues: {
                ...initialData,
                contacts: { phones: initialData.contacts?.phones ?? [], mobiles: initialData.contacts?.mobiles ?? [] },
            },
            mode: "onChange"
        });

    // 2. KEEP ONE useEffect for RHF reset when initialData changes (Edit Mode)
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

    // 3. INITIAL FIELD SAFETY CHECK (Add Mode)
    // This runs once per mount to ensure an initial input field exists.
    useEffect(() => {
        if (isInitialLoad.current) {
            // Check the length of the actual array field in RHF state
            if (phonesField.fields.length === 0) {
                phonesField.append("");
            }
            if (mobilesField.fields.length === 0) {
                mobilesField.append("");
            }
            isInitialLoad.current = false;
        }
        // Dependency arrays rely on the field array instances only for the initial append
    }, [phonesField, mobilesField]);


    const onSubmit = (data: UserFormData) => {
        const cleanPhones = data.contacts?.phones.filter(p => p && p.trim() !== '');
        const cleanMobiles = data.contacts?.mobiles.filter(m => m && m.trim() !== '');

        onNext({ contacts: { phones: cleanPhones, mobiles: cleanMobiles } });
    };

    return (
        <Card title={t('user_list.contact_info')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>

                {/* Phones Section */}
                <Form.Item label={<Flex gap="small"><span>{t('user_list.phone')}</span><RequiredTag /></Flex>}>
                    {/* Map Phone Fields */}
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

                            {/* Remove Button */}
                            <MinusCircleOutlined
                                onClick={() => phonesField.remove(idx)}
                                style={{ cursor: 'pointer', marginTop: 10 }}
                                disabled={phonesField.fields.length === 1}
                            />
                        </Flex>
                    ))}

                    {/* Add Phone Button */}
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


                {/* Mobiles Section */}
                <Form.Item label={<Flex gap="small"><span>{t('user_list.mobile')}</span><RequiredTag /></Flex>}>
                    {/* Map Mobile Fields */}
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
                            <MinusCircleOutlined
                                onClick={() => mobilesField.remove(idx)}
                                style={{ cursor: 'pointer', marginTop: 10 }}
                                disabled={mobilesField.fields.length === 1}
                            />
                        </Flex>
                    ))}

                    {/* Add Mobile Button */}
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