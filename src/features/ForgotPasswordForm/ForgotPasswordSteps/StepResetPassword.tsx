import React from 'react';
import { Form, Input, Button, Space, message, Flex } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/http';
import RequiredTag from '../../../components/RequiredTag';
import { useNavigate } from 'react-router-dom';
import { APP_BASE_PATH } from '../../../app/config';
import { getErrorMessage } from '../../../utils/error';


interface StepResetPasswordProps {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    email: string;
    otp: string;
    token: string;
}

const StepResetPassword: React.FC<StepResetPasswordProps> = ({ setStep, email, token }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const resetPasswordMutation = useMutation({
        mutationFn: async (payload: { password: string }) => {
            
            console.log(token)
            const response = await api.post('v2/auth/forget-password/reset-password', {
                email,
                reset_token: token,
                password: payload.password,
            });
            return response.data;
        },
        onSuccess: (data) => {
            message.success(data?.message || t('forgotPassword.resetSuccess'));
            navigate(`${APP_BASE_PATH}/auth/login`)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            message.error(getErrorMessage(error, t('forgotPassword.resetFailed')));
        },
    });

    const handleSubmit = async () => {
        const { password, confirm } = await form.validateFields();
        if (password !== confirm) return message.error(t('forgotPassword.passwordMismatch'));
        resetPasswordMutation.mutate({ password });
    };



    return (
        <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
                name="password"
                label={<Flex align="start" gap="small">
                    <span>{t('forgotPassword.password')}</span>
                    <RequiredTag />
                </Flex>}
                rules={[
                    { required: true, message: t('forgotPassword.requiredPasswordError') },
                    {
                        min: 8,
                        message: t('forgotPassword.passwordTooShort') || 'Password must be at least 8 characters.',
                    },
                    {
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();

                            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/;

                            if (!strongPasswordRegex.test(value)) {
                                return Promise.reject(
                                    new Error(
                                        t('forgotPassword.weakPassword') ||
                                        'Password must contain uppercase, lowercase, number, and special character.'
                                    )
                                );
                            }

                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <Input.Password prefix={<LockOutlined />} dir="ltr" />
            </Form.Item>


            <Form.Item
                name="confirm"
                label={<Flex align="start" gap="small"><span>{t('forgotPassword.confirmPassword')}</span><RequiredTag /></Flex>}
                dependencies={['password']}
                rules={[
                    { required: true, message: t('forgotPassword.requiredConfirmPasswordError') },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            return !value || getFieldValue('password') === value
                                ? Promise.resolve()
                                : Promise.reject(new Error(t('forgotPassword.passwordMismatch')));
                        },
                    }),
                ]}
            >
                <Input.Password prefix={<LockOutlined />} dir="ltr" />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" onClick={handleSubmit} loading={resetPasswordMutation.isPending} block>
                    {t('forgotPassword.changePassword')}
                </Button>
                <Button onClick={() => setStep(1)} block>{t('forgotPassword.back')}</Button>
            </Space>
        </Form>
    );
}

export default StepResetPassword;
