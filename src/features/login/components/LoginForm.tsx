import { Button, Form, Input } from "antd";
import { useLogin } from "../hooks/useLogin";

export const LoginForm = () => {
    const login = useLogin();

    const handleSubmit = (values: any) => {
        login.mutate(values);
    };

    return (
        <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                <Input placeholder="Email" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                <Input.Password placeholder="Password" />
            </Form.Item>

            <Button
                type="primary"
                htmlType="submit"
                loading={login.isPending}
                block
            >
                Login
            </Button>

            {login.isError && (
                <p style={{ color: "red" }}>
                    {(login.error as any)?.message || "Login failed"}
                </p>
            )}
        </Form>
    );
};
