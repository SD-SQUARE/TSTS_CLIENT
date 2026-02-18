import { useState } from "react";
import { Form, Input, Button, Typography, Alert, Image, Space, Avatar } from "antd";
import { loginSchema } from "../schema/LoginSchema";
import loginImage from "../../../assets/HU-bg-clear.png";
import { APP_BASE_PATH } from "../../../app/config";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { getJWTPayload } from "../../../utils/jwt_payload.utils";

// v2 hooks
import { useLoginV2 } from "../hooks/useLoginV2";
import { useTrustedDeviceAuth } from "../hooks/useTrustedDeviceAuth";
import { useCookies } from 'react-cookie';
const { Title,Text } = Typography;

const LoginFormV2 = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ _, setCookie ] = useCookies(['showTrustedDeviceTour']);

    // 🔐 step control
    const [step, setStep] = useState<"CREDENTIALS" | "DEVICE">("CREDENTIALS");
    const [userId, setUserId] = useState<string | null>(null);

    const loginV2 = useLoginV2();
    const trustedAuth = useTrustedDeviceAuth();

    const gotoMainPage = () => {
        navigate(`${APP_BASE_PATH}/`);
    };

    const goBackToCredentials = () => {
        setStep("CREDENTIALS");
        setUserId(null);
        setError(null);
    };


    const validateForm = (values: any) => {
        const result = loginSchema.safeParse(values);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const firstField = Object.keys(errors)[0];
            const firstMessage = errors[firstField]?.[0] ?? "";

            form.setFields([
                {
                    name: firstField,
                    errors: [firstMessage],
                },
            ]);

            return false;
        }

        form.setFields([
            { name: "email", errors: [] },
            { name: "password", errors: [] },
        ]);

        return true;
    };

    // STEP 1️⃣ email + password
    const onFinish = async (values: any) => {
        if (!validateForm(values)) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await loginV2.mutateAsync(values);

            if (res.step === "TRUSTED_DEVICE_REQUIRED") {
                setUserId(res.userId);
                setStep("DEVICE");
                return;
            }

            // 🟢 Logged in without device
            if (res.step === "LOGGED_IN_NO_DEVICE") {
                dispatch(
                    loginSuccess({
                        user: getJWTPayload(res.access_token),
                        token: res.access_token,
                    })
                );

                // 👇 mark tour needed
                // localStorage.setItem("showTrustedDeviceTour", "1");
                setCookie("showTrustedDeviceTour", "1");

                gotoMainPage();
            }

        } catch (err: any) {
            setError(err.response?.data?.message || t("Login_Failed"));
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 2️⃣ trusted device
    const verifyDevice = async () => {
        if (!userId) return;

        setError(null);

        try {
            const data = await trustedAuth.mutateAsync(userId);

            dispatch(
                loginSuccess({
                    user: getJWTPayload(data.access_token),
                    token: data.access_token,
                })
            );

            gotoMainPage();
        } catch {
            setError(t("Trusted_Device_Verification_Failed"));
        }
    };

    const onValuesChange = (_: any, allValues: any) => {
        if (step === "CREDENTIALS") validateForm(allValues);
    };

    return (
        <div
            className={`login-card ${isHovered ? "hovered" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="login-left">
                <Avatar src={loginImage} shape="square" size={250} style={{objectFit: "contain"}} />
            </div>

            <div className="login-right">
                <Title className="login-title">
                    {step === "CREDENTIALS"
                        ? t("Login")
                        : t("Verify_Trusted_Device")}
                </Title>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* STEP 1: EMAIL + PASSWORD */}
                {step === "CREDENTIALS" && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        onValuesChange={onValuesChange}
                        requiredMark={false}
                        validateTrigger="onChange"
                        dir={i18next.language === "ar" ? "rtl" : "ltr"}
                    >
                        <Form.Item
                            name="email"
                            label={t("Email")}
                            validateDebounce={400}
                            rules={[
                                { required: true, message: t("Email_IS_Required") },
                                { type: "email", message: t("Invalid_email_address_format") },
                            ]}
                        >
                            <Input
                                placeholder="example@mail.com"
                                className="login-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={t("Password")}
                            validateDebounce={400}
                            rules={[
                                { required: true, message: t("Password_is_required") },
                                { min: 8, message: t("Must_be_at_least_8_characters") },
                                { pattern: /[A-Z]/, message: t("Must_contain_an_uppercase_letter") },
                                { pattern: /[0-9]/, message: t("Must_contain_a_number") },
                                {
                                    pattern: /[^A-Za-z0-9]/,
                                    message: t("Must_contain_a_special_character"),
                                },
                            ]}
                        >
                            <Input.Password
                                placeholder="********"
                                className="login-input"
                            />
                        </Form.Item>

                        <div className="forgot-password">
                            <NavLink to={`${APP_BASE_PATH}/auth/forgot-password`}>
                                {t("Forgot_Password")}?
                            </NavLink>
                        </div>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                                block
                                className="login-button"
                            >
                                {t("Login")}
                            </Button>
                        </Form.Item>

                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }} >
                            <NavLink to={`${APP_BASE_PATH}/auth/first-time/login`}>
                                <Text style={{
                                    color: "var(--color-primary)",
                                    opacity: "0.8",
                                }}
                                    strong
                                >
                                    {t("First_Time")}   
                                </Text>
                            </NavLink>
                        </div>
                    </Form>
                )}

                {/* STEP 2: TRUSTED DEVICE */}
                {step === "DEVICE" && (
                    <Alert
                        type="info"
                        showIcon
                        message={t("Verify_Trusted_Device")}
                        description={
                            <Space vertical size={16} style={{ width: "100%" }}>
                                <Text>{t("Use_Your_Registered_Device")}</Text>

                                <Button
                                    type="primary"
                                    loading={trustedAuth.isPending}
                                    onClick={verifyDevice}
                                    block
                                >
                                    {t("Verify_Device")}
                                </Button>

                                <Button
                                    type="default"
                                    onClick={goBackToCredentials}
                                    block
                                >
                                    {t("Back")}
                                </Button>
                            </Space>
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default LoginFormV2;
