
import PageLayout from "../../../components/PageLayout";
import LoginForm from "../components/LoginForm";
import LoginFormV2 from "../components/LoginFormV2";

export const LoginPage = () => {
    return (
            <PageLayout>
                <div style={{ width: '100%', marginTop: 40,}}>
                    {/* <LoginForm /> */}
                    <LoginFormV2 />
                </div>
            </PageLayout>
    );
};