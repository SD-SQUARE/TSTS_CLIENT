// tabs/settings/ResetPassword.tsx
import { Button, Card, Empty, Form, Input, Typography, message } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useResetPassword } from "../hooks/useResetPassword.hook";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const ResetPassword = ({ searchTerm = "" }: { searchTerm?: string }) => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";
    const resetPassword = useResetPassword(userId);
    const [form] = Form.useForm();
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
        !normalizedSearch ||
        [
            t("profile.settings.reset.title"),
            t("profile.settings.reset.description"),
            t("profile.settings.reset.newPassword"),
            t("profile.settings.reset.confirmPassword"),
        ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

    const handleSubmit = async (values: {
        password: string;
        confirm: string;
    }) => {
        setLoading(true);

        const { password } = values;
        resetPassword.mutate({ password });

        // Simulate API call
        // setTimeout(() => {
            setLoading(false);
            message.success(t("profile.settings.reset.success"));
            form.resetFields();
        // }, 1200);
    };

    if (!matchesSearch) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("profile.settings.noSearchResults")}
            />
        );
    }

    return (
        <Card
            style={{
                maxWidth: "100%",
                borderRadius: 12,
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            }}
        >
            <Title level={5} style={{ marginBottom: 4 }}>
                {t("profile.settings.reset.title")}
            </Title>

            <Text type="secondary">
                {t("profile.settings.reset.description")}
            </Text>

            <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                style={{ marginTop: 24 }}
            >
                <Form.Item
                    label={t("profile.settings.reset.newPassword")}
                    name="password"
                    rules={[
                        { required: true, message: t("profile.settings.reset.passwordRequired") },
                        {
                            min: 8,
                            message: t("profile.settings.reset.passwordMin"),
                        },
                        {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: t("profile.settings.reset.weakPassword"),
                        },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder={t("profile.settings.reset.newPassword")}
                    />
                </Form.Item>

                <Form.Item
                    label={t("profile.settings.reset.confirmPassword")}
                    name="confirm"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                        { required: true, message: t("profile.settings.reset.confirmRequired") },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error(t("profile.settings.reset.passwordMismatch"))
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<SafetyOutlined />}
                        placeholder={t("profile.settings.reset.confirmPassword")}
                    />
                </Form.Item>

                <Text type="secondary" style={{ fontSize: 12 }}>
                    {t("profile.settings.reset.hint")}
                </Text>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{ marginTop: 16 }}
                >
                    {t("profile.settings.reset.submit")}
                </Button>
            </Form>
        </Card>
    );
};

export default ResetPassword;
