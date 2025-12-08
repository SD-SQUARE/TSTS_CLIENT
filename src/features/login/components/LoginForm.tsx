import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Input, Button, Typography, Alert ,Image} from "antd";
import { loginSchema } from "../schema/LoginSchema";
import { loginSuccess } from "../store/authSlice";
import loginImage from "../../../assets/HU-bg-clear.png"
import axios from "axios";
import NavItem from "../../../components/layouts/Nav/components/NavItem";
import { APP_BASE_PATH } from "../../../app/config";
import { NavLink } from "react-router-dom";
const { Title } = Typography;

const LoginForm = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
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
      const response = await axios.post("/auth/login", values);
      const { user, accessToken } = response.data;

    
      sessionStorage.setItem("token", accessToken);

      dispatch(loginSuccess({ user  , token: accessToken,}));

      window.location.href = "/profile";
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
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
        <Title className="login-title">Login</Title>

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
        >
        <Form.Item
          name="email"
          label="Email"
          validateTrigger="onChange"
          validateDebounce={400}
          validateFirst
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email address format" },
          ]}
        >
          <Input placeholder="example@mail.com" className="login-input" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          validateTrigger="onChange"
          validateDebounce={400}
          validateFirst
          rules={[
            { required: true, message: "Password is required" },
            { min: 6, message: "Must be at least 6 characters" },
            { pattern: /[A-Z]/, message: "Must contain an uppercase letter" },
            { pattern: /[0-9]/, message: "Must contain a number" },
            { pattern: /[^A-Za-z0-9]/, message: "Must contain a special character" },
          ]}
        >
          <Input.Password placeholder="********" className="login-input" />
        </Form.Item>


          <div className="forgot-password">
                      <NavLink to={`${APP_BASE_PATH}/auth/forgot-password`}> 
                            Forget password?
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
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
