
import PageLayout from "../../../components/PageLayout";
import LoginForm from "../components/LoginForm";

export const LoginPage = () => {
    return (
            <PageLayout>
                <div style={{ width: '100%', marginTop: 40,}}>
                    <LoginForm />
                </div>
            </PageLayout>
    );
};