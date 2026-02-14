import { Card, Tabs, Tour } from "antd";
import {
    LockOutlined,
    SafetyOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ResetPassword from "../ResetPassword.component";
import TrustedDevices from "../TrustedDevices.component";
import Extension from "../Extension.component";
import useTrustedDevices from "../../hooks/useTrustedDevices.hook";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCookies } from 'react-cookie';

const SettingsTab = ({ forceDevices, onTourReady }: any) => {
    const { t } = useTranslation();
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";

    const { devicesQuery } = useTrustedDevices(userId);

    const [activeTab, setActiveTab] = useState("password");
    const [tourOpen, setTourOpen] = useState(false);
    const [skip, setskip] = useState(false);
    const [ cookie , setCookie, removeCookie ] = useCookies(['showTrustedDeviceTour', 'skipTrustedDeviceTour-for-week']);

    useEffect(() => {
        if (cookie["skipTrustedDeviceTour-for-week"]) {
            setskip(true);
        }
        if (!forceDevices) return;

        setActiveTab("devices");

        const timer = setTimeout(() => {
            setTourOpen(true);
        }, 400);

        return () => clearTimeout(timer);
    }, [forceDevices]);


    useEffect(() => {
        if (!tourOpen) return;

        const el = document.querySelector("#add-trusted-device-card");
        if (!el) return;

        const handleClick = () => {
            setTourOpen(() => false); // ✅ no stale state
            onTourReady?.();
        };

        el.addEventListener("click", handleClick);

        return () => {
            el.removeEventListener("click", handleClick);
        };
    }, [tourOpen]);

    

  

    return (
        <>
            {!skip && (<Tour
                open={tourOpen}
                onClose={() => {
                    setTourOpen(false);
                    setCookie("showTrustedDeviceTour", "0");
                    setskip(true);
                    setCookie("skipTrustedDeviceTour-for-week", "1");
                }}
                steps={[
                    {
                        title: t("tour.secureAccount"),
                        description: t("tour.addTrustedDevice"),
                        target: () =>
                            document.querySelector("#add-trusted-device-card"),
                        nextButtonProps: { style: { display: "none" } },
                        prevButtonProps: { style: { display: "none" } },
                    },
                ]}
            />)}

            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Tabs
                    id="settings-tabs"
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key);
                        if (key === "devices") devicesQuery.refetch();
                    }}
                    tabPlacement="start"
                    items={[
                        {
                            key: "password",
                            label: (
                                <span>
                                    <LockOutlined /> {t("profile.settings.password")}
                                </span>
                            ),
                            children: <ResetPassword />,
                        },
                        {
                            key: "devices",
                            label: (
                                <span >
                                    <SafetyOutlined /> {t("profile.settings.devices")}
                                </span>
                            ),
                            children: <TrustedDevices />,
                        },
                        {
                            key: "extension",
                            label: (
                                <span>
                                    <AppstoreOutlined /> {t("profile.settings.extension")}
                                </span>
                            ),
                            children: <Extension />,
                        },
                    ]}
                />
            </Card>
        </>
    );
};

export default SettingsTab;
