/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Typography, Alert, Flex } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/http';
import RequiredTag from '../../../components/RequiredTag';
import { getErrorMessage } from '../../../utils/error';


const { Paragraph } = Typography;

interface StepOtpProps {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    email: string;
    setUid: React.Dispatch<React.SetStateAction<string>>;
    setOtp: React.Dispatch<React.SetStateAction<string>>;
    setToken: React.Dispatch<React.SetStateAction<string>>;
    uid: string;
}

const maskEmail = (email: string): string => {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.slice(0, 3) + '*'.repeat(Math.max(0, name.length - 3));
    const [domainName, domainExt] = domain.split('.');
    const maskedDomain = domainName.slice(0, 2) + '*'.repeat(Math.max(1, domainName.length - 2));
    return `${maskedName}@${maskedDomain}.${domainExt}`;
};

const StepOtp: React.FC<StepOtpProps> = ({ setStep, email, setOtp, setToken, uid, setUid }) => {
    const [countdown, setCountdown] = useState(30);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const verifyOtpMutation = useMutation({
        mutationFn: async (otp: string) => {
            console.log(uid)
            const response = await api.post('v2/auth/forget-password/verify-otp', { oid: uid, otp });
            return response.data; 
        },
        onSuccess: (data) => {
            message.success(data?.message || t('forgotPassword.otpVerified'));
            console.log(data)
            setOtp(data.otp);
            setToken(data.reset_token);
            setTimeout(() => setStep(2), 600);
        },
        onError: (error: any) => {
            message.error(getErrorMessage(error, t('forgotPassword.otpInvalid')));
        },
    });



    const handleVerify = () => {
        const otpValue = form.getFieldValue('otp');
        verifyOtpMutation.mutate(otpValue);
    };

    const resendOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('v2/auth/forget-password/', { email });
            return response.data;
        },
        onSuccess: (data) => {
            message.success(data?.message || t('forgotPassword.otpResend'));
            setUid(data.oid);
            setCountdown(30);
        },
        onError: (error: any) => {
            message.error(getErrorMessage(error, t('forgotPassword.otpResendError')));
        },
    });

    const handleResend = () => {
        resendOtpMutation.mutate();
    };



    return (
        <Form form={form} layout="vertical" requiredMark={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                    type="info"
                    showIcon
                    message={
                        <Paragraph style={{ marginBottom: 0 }}>
                            <MailOutlined style={{ marginRight: 6, marginLeft: 6 }} />
                            {t('forgotPassword.otpInfo')} <b>{maskEmail(email)}</b>.
                        </Paragraph>
                    }
                />

                <Form.Item
                    name="otp"
                    label={
                        <Flex align="start" gap="small">
                            <span>{t('forgotPassword.otpLabel')}</span>
                            <RequiredTag />
                        </Flex>
                    }
                    rules={[{ required: true, message: t('forgotPassword.requiredOtpError') }]}
                >
                    <Flex justify="center">
                        <Flex justify="center" style={{ width: '350px', marginTop: 20 }}>
                            <Input.OTP
                                className="custom-otp"
                                style={{ direction: 'ltr' }} // ✅ enforce LTR always
                                inputMode="numeric"
                                separator={<span style={{ color: '#0f0f0f8a' }}>—</span>}
                                onChange={(text) => {
                                    const otp = text.replace(/\D/g, '');
                                    form.setFieldsValue({ otp });
                                    if (otp.length === 6) handleVerify();
                                }}
                            />
                        </Flex>
                    </Flex>
                </Form.Item>

                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                        type="primary"
                        loading={verifyOtpMutation.isPending}
                        onClick={handleVerify}
                        block
                    >
                        {t('forgotPassword.verifyOtp')}
                    </Button>

                    <Button type="link" onClick={handleResend} disabled={countdown > 0}>
                        {countdown > 0
                            ? `${t('forgotPassword.otpResendIn')} ${countdown}s`
                            : t('forgotPassword.otpResend')}
                    </Button>

                    <Button onClick={() => setStep(0)} block>
                        {t('forgotPassword.back')}
                    </Button>
                </Space>
            </Space>
        </Form>
    );
};

export default StepOtp;
