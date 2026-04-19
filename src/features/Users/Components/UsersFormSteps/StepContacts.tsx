/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Form, Card, Flex, Input, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useForm, useFieldArray } from "react-hook-form";

import { t } from "i18next";
import type { UserFormData } from "../../Types/users";
import type { UserFormStepHandle } from "./types";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepContacts = forwardRef<UserFormStepHandle, Props>(({ initialData, onNext }, ref) => {

    const isInitialLoad = useRef(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { handleSubmit, control, formState: { errors }, reset, getValues } =
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

    useImperativeHandle(ref, () => ({
        getValues: () => {
            const data = getValues();
            const cleanPhones = data.contacts?.phones?.filter(p => p && p.trim() !== '') || [];
            const cleanMobiles = data.contacts?.mobiles?.filter(m => m && m.trim() !== '') || [];

            return { contacts: { phones: cleanPhones, mobiles: cleanMobiles } };
        },
    }), [getValues]);

    return (
        <Card title={t('user_list.contact_info')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form">
                <Flex gap="large" wrap="wrap">
                    
                    <Form.Item label={t('user_list.phone')} style={{ flex: 1, minWidth: '300px' }}>
                        {phonesField.fields.map((field, idx) => (
                            <Flex gap="small" key={field.id} style={{ marginBottom: 8, alignItems: 'center' }}>
                                <Controller
                                    name={`contacts.phones.${idx}`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Input {...controllerField} />
                                    )}
                                />
                                {phonesField.fields.length > 1 && (
                                    <MinusCircleOutlined onClick={() => phonesField.remove(idx)} />
                                )}
                            </Flex>
                        ))}
                        <Button
                            type="dashed"
                            onClick={() => phonesField.append("")}
                            block
                            icon={<PlusOutlined />}
                        >
                            {t('user_list.add_phone')}
                        </Button>
                    </Form.Item>

                    <Form.Item label={t('user_list.mobile')} style={{ flex: 1, minWidth: '300px' }}>
                        {mobilesField.fields.map((field, idx) => (
                            <Flex gap="small" key={field.id} style={{ marginBottom: 8, alignItems: 'center' }}>
                                <Controller
                                    name={`contacts.mobiles.${idx}`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Input {...controllerField}  />
                                    )}
                                />
                                {mobilesField.fields.length > 1 && (
                                    <MinusCircleOutlined onClick={() => mobilesField.remove(idx)} />
                                )}
                            </Flex>
                        ))}
                        <Button
                            type="dashed"
                            onClick={() => mobilesField.append("")}
                            block
                            icon={<PlusOutlined />}
                        >
                            {t('user_list.add_mobile')}
                        </Button>
                    </Form.Item>
                    
                </Flex>
            </Form>
        </Card>
    );
});

StepContacts.displayName = "StepContacts";

export default StepContacts;
