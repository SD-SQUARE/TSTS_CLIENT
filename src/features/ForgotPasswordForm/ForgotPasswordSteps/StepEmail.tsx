import React from 'react';
import { Form, Input, Button, message, Flex } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/http';
import RequiredTag from '../../../components/RequiredTag';


interface StepEmailProps {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setUid: React.Dispatch<React.SetStateAction<string>>;
}

const StepEmail: React.FC<StepEmailProps> = ({ setStep, setEmail, setUid }) => {

    const [form] = Form.useForm();
    const { t } = useTranslation();

    const sendOtpMutation = useMutation({
        mutationFn: async (email: string) => {
            const response = await api.post('/forgetpassword', { email });
            return response.data; 
        },
        onSuccess: (data) => {
            message.success(data.message || t('forgotPassword.otpSent'));
            setUid(data.uid); 
            setStep(1);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            message.error(error.response?.data?.message || t('forgotPassword.sendOtpError'));
        },
    });


    const handleSendOtp = async () => {
        const { email } = await form.validateFields();
        setEmail(email);
        sendOtpMutation.mutate(email);
    };

    return (
        <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
                name="email"
                label={<Flex align="start" gap="small"><span>{t('forgotPassword.emailLabel')}</span><RequiredTag /></Flex>}
                rules={[
                    { required: true, message: t('forgotPassword.requiredEmailError') },
                    { type: 'email', message: t('forgotPassword.invalidEmailError') },
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="example@email.com" />
            </Form.Item>

            <Button type="primary" onClick={handleSendOtp} loading={sendOtpMutation.isPending} block>
                {t('forgotPassword.sendOtp')}
            </Button>
        </Form>
    );
};

export default StepEmail;
