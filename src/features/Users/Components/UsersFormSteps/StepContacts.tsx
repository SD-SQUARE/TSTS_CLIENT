/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef } from "react";
import { Form, Card, Flex, Input, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useForm, useFieldArray } from "react-hook-form";

import { t } from "i18next";
import type { UserFormData } from "../../Types/users";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepContacts: React.FC<Props> = ({ initialData, onNext }) => {

    const isInitialLoad = useRef(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
};
export default StepContacts;