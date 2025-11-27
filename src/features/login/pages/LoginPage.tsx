import React from 'react';
import LoginForm from "../components/LoginForm";
import PublicLayout from "../../../components/PublicLayout"; 

export const LoginPage = () => {
    return (
        <PublicLayout>
            <div style={{ width: '100%', maxWidth: '950px' }}>
                <LoginForm />
            </div>
        </PublicLayout>
    );
};