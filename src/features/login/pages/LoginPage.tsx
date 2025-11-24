import { Card } from "antd";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
    return (
        <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
            <Card title="Login" style={{ width: 350 }}>
                <LoginForm />
            </Card>
        </div>
    );
};
