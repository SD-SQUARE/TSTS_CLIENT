import React, { useEffect } from "react";
import { Form, Input, Card, Flex, Upload, Avatar } from "antd";
import { Controller, useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";
import type { UserFormData } from "../../Types/users";
import RequiredTag from "../../../../components/RequiredTag";


interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepInfo: React.FC<Props> = ({ initialData, onNext }) => {
    const { handleSubmit, control, formState: { errors }, reset, setValue, watch } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });

    useEffect(() => { reset(initialData); }, [initialData, reset]);
    const { t } = useTranslation();
    
    // console.log(initialData);
    
    const imageFile = watch("image");
    const getImageSrc = () => {
        if (!imageFile) return undefined;
        if (typeof imageFile === "string") return imageFile;
        return URL.createObjectURL(imageFile);
    };

    const onSubmit = (data: UserFormData) => {
        onNext({ image: data.image, first_name: data.first_name, mid_name: data.mid_name, last_name: data.last_name, ssn: data.ssn });
    };

    return (
        <Card title = {t("user_list.personal_info")}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item style={{width: "100%", display: "flex", justifyContent: "center", textAlign: "center"}} >
                    <Controller
                        name="image"
                        control={control}
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        render={({ field }) => (
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={file => { setValue("image", file); return false; }}
                            >
                                <Avatar src={getImageSrc()} size={70} />
                                <div style={{ marginTop: 8 }}><a>{t("user_list.upload_image")}</a></div>
                            </Upload>
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.fname")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.first_name ? "error" : ""} help={errors.first_name?.message} required>
                    <Controller name="first_name" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.mname")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.mid_name ? "error" : ""} help={errors.mid_name?.message} required>
                    <Controller name="mid_name" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.lname")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.last_name ? "error" : ""} help={errors.last_name?.message} required>
                    <Controller name="last_name" control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.ssn")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.ssn ? "error" : ""} help={errors.ssn?.message} required>
                    <Controller name="ssn" control={control}
                        rules={{ required: "Required", pattern: { value: /^[0-9]{10,20}$/, message: "Invalid SSN" } }}
                        render={({ field }) => <Input {...field} />} />
                </Form.Item>
            </Form>
        </Card>
    );
};
export default StepInfo;
