
import Body from "../../../components/layouts/Body";
import LoginForm from "../components/LoginForm";

export const LoginPage = () => {
    return (
            <Body>
                <div style={{ width: '100%', marginTop: 40,}}>
                    <LoginForm />
                </div>
            </Body>
    );
};