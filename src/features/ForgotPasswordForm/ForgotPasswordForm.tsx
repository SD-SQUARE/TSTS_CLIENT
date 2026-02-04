import { useState } from 'react';
import { Card, Steps } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import StepEmail from './ForgotPasswordSteps/StepEmail';
import StepOtp from './ForgotPasswordSteps/StepOtp';
import StepResetPassword from './ForgotPasswordSteps/StepResetPassword';
import { useTranslation } from 'react-i18next';
import PageLayout from '../../components/PageLayout';


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
        { title: t('forgotPassword.steps.email'), icon: <MailOutlined />,  },
        { title: t('forgotPassword.steps.otp'), icon: <SafetyOutlined />, },
        { title: t('forgotPassword.steps.reset'), icon: <LockOutlined />, },
    ];
    const stepsForm = [
        { content: <StepEmail {...{ setStep, setEmail, setUid }} /> },
        { content: <StepOtp {...{ setStep, email, setOtp, setToken, uid , setUid}} /> },
        { content: <StepResetPassword {...{ setStep, email, otp, token }} /> },
    ];


    return (
        <PageLayout>
            <div style={{display: 'flex',justifyContent:'center', alignItems:"center", height: '100%'}}>
                <Card
                    title={t('forgotPassword.title')} 
                    style={{ width: "50%",height: "auto" , borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: isArabic? 'right' : 'left' }}
                >
                    <Steps current={step} items={steps} size="default" style={{ marginBottom: 30 }} />
                    {stepsForm[step].content}
                </Card>
            </div>
        </PageLayout>
    );
};

export default ForgotPasswordForm;
