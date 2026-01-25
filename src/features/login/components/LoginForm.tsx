import {  useState } from "react";
import { Form, Input, Button, Typography, Alert ,Image} from "antd";
import { loginSchema } from "../schema/LoginSchema";
import loginImage from "../../../assets/HU-bg-clear.png"
import { APP_BASE_PATH } from "../../../app/config";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
const { Title } = Typography;

const LoginForm = () => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const gotoMainPage = () => {
        navigate(`${APP_BASE_PATH}/`);
    }
    const { mutateAsync: login } = useLogin(gotoMainPage);
    
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
  

  const onFinish = async (values: any) => {
    if (!validateForm(values)) return;

    setIsLoading(true);
    setError(null);

      try {
          await login(values);
    } catch (err: any) {
      setError(err.response?.data?.message || t("Login_Failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const onValuesChange = (_, allValues: any) => {
    validateForm(allValues);
  };

    
  return (
    <div
      className={`login-card ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="login-left">
        <Image src={loginImage} preview={false}/>
        </div>

      <div className="login-right">
        <Title className="login-title">{t("Login")}</Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

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
          validateTrigger="onChange"
          validateDebounce={400}
          validateFirst
          rules={[
            { required: true, message: t("Email_IS_Required") },
            { type: "email", message: t("Invalid_email_address_format") },
          ]}
        >
          <Input placeholder="example@mail.com" className="login-input" />
        </Form.Item>

        <Form.Item
          name="password"
          label={t("Password")}
          validateTrigger="onChange"
          validateDebounce={400}
          validateFirst
          rules={[
            { required: true, message: t("Password_is_required") },
            { min: 8, message: t("Must_be_at_least_8_characters") },
            { pattern: /[A-Z]/, message: t("Must_contain_an_uppercase_letter") },
            { pattern: /[0-9]/, message: t("Must_contain_a_number") },
            { pattern: /[^A-Za-z0-9]/, message: t("Must_contain_a_special_character") },
          ]}
        >
          <Input.Password placeholder="********" className="login-input" />
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
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
