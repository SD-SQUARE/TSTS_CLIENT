// tabs/SettingsTab.tsx
import { Card, Tabs } from "antd";
import {
    LockOutlined,
    SafetyOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";

import ResetPassword from "../ResetPassword.component";
import TrustedDevices from "../TrustedDevices.component";
import Extension from "../Extension.component";

const SettingsTab = () => {
    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 16,
                boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                minHeight: 400,
            }}
        >
            <Tabs
                tabPlacement="start"
                size="large"
                items={[
                    {
                        key: "password",
                        label: (
                            <span>
                                <LockOutlined /> Reset Password
                            </span>
                        ),
                        children: <ResetPassword />,
                    },
                    {
                        key: "devices",
                        label: (
                            <span>
                                <SafetyOutlined /> Trusted Devices
                            </span>
                        ),
                        children: <TrustedDevices />,
                    },
                    {
                        key: "extension",
                        label: (
                            <span>
                                <AppstoreOutlined /> Extension
                            </span>
                        ),
                        children: <Extension />,
                    },
                ]}
                styles={{
                    content: {
                        padding: "24px 32px",
                        minHeight: 320,
                    },
                }}
            />
        </Card>
    );
};

export default SettingsTab;
