// tabs/settings/ResetPassword.tsx
import { Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useResetPassword } from "../hooks/useResetPassword.hook";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";
    const resetPassword = useResetPassword(userId);
    const [form] = Form.useForm();

    const handleSubmit = async (values: {
        password: string;
        confirm: string;
    }) => {
        setLoading(true);

        const { password } = values;
        resetPassword.mutate({ password });

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            message.success("Password updated successfully");
            form.resetFields();
        }, 1200);
    };

    return (
        <Card
            style={{
                maxWidth: "100%",
                borderRadius: 12,
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            }}
        >
            <Title level={5} style={{ marginBottom: 4 }}>
                Reset Password
            </Title>

            <Text type="secondary">
                Choose a strong password to keep your account secure.
            </Text>

            <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                style={{ marginTop: 24 }}
            >
                <Form.Item
                    label="New Password"
                    name="password"
                    rules={[
                        { required: true, message: "Password is required" },
                        {
                            min: 8,
                            message: "Password must be at least 8 characters",
                        },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter new password"
                    />
                </Form.Item>

                <Form.Item
                    label="Confirm Password"
                    name="confirm"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                        { required: true, message: "Please confirm password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("Passwords do not match")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<SafetyOutlined />}
                        placeholder="Confirm new password"
                    />
                </Form.Item>

                <Text type="secondary" style={{ fontSize: 12 }}>
                    Password must be at least 8 characters long.
                </Text>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{ marginTop: 16 }}
                >
                    Reset Password
                </Button>
            </Form>
        </Card>
    );
};

export default ResetPassword;
