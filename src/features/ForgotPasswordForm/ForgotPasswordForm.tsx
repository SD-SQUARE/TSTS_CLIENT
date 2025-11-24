import { useState } from 'react';
import { Card, Steps } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import StepEmail from './ForgotPasswordSteps/StepEmail';
import StepOtp from './ForgotPasswordSteps/StepOtp';
import StepResetPassword from './ForgotPasswordSteps/StepResetPassword';
import { useTranslation } from 'react-i18next';


const ForgotPasswordForm = () => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const { t , i18n} = useTranslation();

    const isArabic = i18n.language === 'ar';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [uid, setUid] = useState('');
    const [token, setToken] = useState('');

    const steps = [
        { title: t('forgotPassword.steps.email'), icon: <MailOutlined />, content: <StepEmail {...{ setStep, setEmail, setUid }} /> },
        { title: t('forgotPassword.steps.otp'), icon: <SafetyOutlined />, content: <StepOtp {...{ setStep, email, setOtp, setToken }} /> },
        { title: t('forgotPassword.steps.reset'), icon: <LockOutlined />, content: <StepResetPassword {...{ setStep, email, otp, token }} /> },
    ];


    return (
        <Card
            title={t('forgotPassword.title')}
            style={{ maxWidth: 480, margin: '50px auto', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: isArabic? 'right' : 'left' }}
        >
            <Steps current={step} items={steps} size="small" style={{ marginBottom: 30 }} />
            {steps[step].content}
        </Card>
    );
};

export default ForgotPasswordForm;
