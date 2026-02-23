import React, { useEffect } from "react";
import { Form, Input, Card, Flex, Upload, Avatar } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CameraOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { UserFormData } from "../../Types/users";
import RequiredTag from "../../../../components/RequiredTag";

const ENGLISH_REGEX = /^[A-Za-z\s.,!?'"()@&$-]+$/;
const ARABIC_REGEX = /^[\u0600-\u06FF\s\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF.,!?'"()@&$-]+$/u;

interface Props { initialData: UserFormData; onNext: (data: Partial<UserFormData>) => void; }

const StepInfo: React.FC<Props> = ({ initialData, onNext }) => {
    const { handleSubmit, control, formState: { errors }, reset, setValue,getValues, watch } =
        useForm<UserFormData>({ defaultValues: initialData, mode: "onChange" });

    const isEditMode = !!initialData.first_name_ar;

    useEffect(() => { reset(initialData); }, [initialData, reset]);
    const { t } = useTranslation();

    const handleNamePartChange = (lang: 'en' | 'ar') => {
        if (isEditMode) return; 

        const values = getValues();
        const f = values[`first_name_${lang}`] || "";
        const m = values[`mid_name_${lang}`] || "";
        const l = values[`last_name_${lang}`] || "";
        
        const full = `${f} ${m} ${l}`.trim().replace(/\s+/g, ' ');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(`full_name_${lang}` as any, full, { shouldValidate: true });
    };


    const imageFile = watch("image");
    const getImageSrc = () => {
        if (!imageFile) return undefined;
        if (typeof imageFile === "string") return imageFile;
        return URL.createObjectURL(imageFile);
    };

    const onSubmit = (data: UserFormData) => {
        onNext({ image: data.image, first_name_en: data.first_name_en, first_name_ar: data.first_name_ar, mid_name_en: data.mid_name_en, mid_name_ar: data.mid_name_ar, last_name_en: data.last_name_en, last_name_ar: data.last_name_ar, full_name_en: data.full_name_en, full_name_ar: data.full_name_ar, ssn: data.ssn });
    };

    const hoverStyles = `
        .avatar-wrapper {
            position: relative;
            border-radius: 50%;
            display: inline-block;
            cursor: pointer; /* Set cursor to pointer */
        }
        .avatar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5); /* Darker background */
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .avatar-wrapper:hover .avatar-overlay {
            opacity: 1; /* Show overlay on hover */
        }
    `;

    return (
        <Card title={t("user_list.personal_info")}>
            <style>{hoverStyles}</style>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>
                <Form.Item style={{ width: "100%", display: "flex", justifyContent: "center", textAlign: "center" }} >
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
                                <div className="avatar-wrapper" style={{ width: 70, height: 70 }}>
                                    <Avatar src={getImageSrc()} size={70} />

                                    <div className="avatar-overlay">
                                        <CameraOutlined style={{ fontSize: '24px', color: '#fff' }} />
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}><a>{t("user_list.upload_image")}</a></div>
                            </Upload>
                        )}
                    />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.fname_ar")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.first_name_ar ? "error" : ""} help={errors.first_name_ar?.message} required>
                    <Controller name="first_name_ar" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ARABIC_REGEX,
                                message: t("arabic_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} onChange={(e) => {
                            field.onChange(e); 
                            handleNamePartChange('ar'); 
                        }} />} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.mname_ar")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.mid_name_ar ? "error" : ""} help={errors.mid_name_ar?.message} required>
                    <Controller name="mid_name_ar" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ARABIC_REGEX,
                                message: t("arabic_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} onChange={(e) => {
                            field.onChange(e); 
                            handleNamePartChange('ar'); 
                        }}/>} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.lname_ar")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.last_name_ar ? "error" : ""} help={errors.last_name_ar?.message} required>
                    <Controller name="last_name_ar" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ARABIC_REGEX,
                                message: t("arabic_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} onChange={(e) => {
                            field.onChange(e); 
                            handleNamePartChange('ar'); 
                        }}/>} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.full_name_ar")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.full_name_ar ? "error" : ""} help={errors.full_name_ar?.message} required>
                    <Controller
                        name="full_name_ar"
                        control={control}
                        rules={{ required: t("required"), pattern: { value: ARABIC_REGEX, message: t("arabic_only") } }}
                        render={({ field }) => <Input {...field} placeholder={t("user_list.full_name_placeholder")} />}
                    />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.fname_en")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.first_name_en ? "error" : ""} help={errors.first_name_en?.message} required>
                    <Controller name="first_name_en" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ENGLISH_REGEX,
                                message: t("english_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} onChange={(e) => {
                            field.onChange(e); 
                            handleNamePartChange('en'); 
                        }}/>} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.mname_en")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.mid_name_en ? "error" : ""} help={errors.mid_name_en?.message} required>
                    <Controller name="mid_name_en" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ENGLISH_REGEX,
                                message: t("english_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} onChange={(e) => {
                            field.onChange(e); 
                            handleNamePartChange('en'); 
                        }}/>} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.lname_en")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.last_name_en ? "error" : ""} help={errors.last_name_en?.message} required>
                    <Controller name="last_name_en" control={control}
                        rules={{
                            required: t("required"), pattern: {
                                value: ENGLISH_REGEX,
                                message: t("english_only"),
                            }
                        }}
                        render={({ field }) => <Input {...field} onChange={(e) => {
                            field.onChange(e); 
                            handleNamePartChange('en'); 
                        }}/>} />
                </Form.Item>
                <Form.Item label={<Flex gap="small"><span>{t("user_list.full_name_en")}</span><RequiredTag /></Flex>}
                    validateStatus={errors.full_name_en ? "error" : ""} help={errors.full_name_en?.message} required>
                    <Controller
                        name="full_name_en"
                        control={control}
                        rules={{ required: t("required"), pattern: { value: ENGLISH_REGEX, message: t("english_only") } }}
                        render={({ field }) => <Input {...field} placeholder={t("user_list.full_name_placeholder")} />}
                    />
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
