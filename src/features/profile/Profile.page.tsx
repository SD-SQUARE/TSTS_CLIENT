import { Spin, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import ProfileTab from "./components/tabs/ProfileTab.component";
import GroupsTab from "./components/tabs/GroupsTab.component";
import SpecializationsTab from "./components/tabs/SpecializationsTab.component";
import SettingsTab from "./components/tabs/SettingsTab.component";
import i18next from "i18next";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Profile = () => {
    const { t } = useTranslation();
    const auth = useSelector((state: any) => state.auth);

    const [activeMainTab, setActiveMainTab] = useState("profile");
    const [forceSettingsDevices, setForceSettingsDevices] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("showTrustedDeviceTour")) {
            setActiveMainTab("settings");
            setForceSettingsDevices(true);
        }
    }, []);

    if (!auth.user) return <Spin fullscreen size="large" />;

    const userType = auth.user.role.toLowerCase();
    const isRequester = userType === "requester";

    const itemOfNoneRequester = [
        {
            key: "profile",
            label: t("profile.tabs.profile"),
            children: <ProfileTab />,
        },
        {
            key: "groups",
            label: t("profile.tabs.groups"),
            children: <GroupsTab />,
        },
        {
            key: "specializations",
            label: t("profile.tabs.specializations"),
            children: <SpecializationsTab />,
        },
        {
            key: "settings",
            label: t("profile.tabs.settings"),
            children: (
                <SettingsTab
                    forceDevices={forceSettingsDevices}
                    onTourReady={() => {
                        console.log("onTourReady"); 
                        localStorage.removeItem("showTrustedDeviceTour");
                     }}
                />
            ),
        },
    ]
    const itemOfRequester = [
        {
            key: "profile",
            label: t("profile.tabs.profile"),
            children: <ProfileTab />,
        },
        {
            key: "settings",
            label: t("profile.tabs.settings"),
            children: (
                <SettingsTab
                    forceDevices={forceSettingsDevices}
                    onTourReady={() =>
                        localStorage.removeItem("showTrustedDeviceTour")
                    }
                />
            ),
        },
    ]

    return (
        <div style={{ padding: "1rem" }}>
            {/* <TrustedDeviceTour /> */}
            <Tabs
                type="card"
                activeKey={activeMainTab}
                onChange={setActiveMainTab}
                destroyOnHidden  
                items={isRequester ? itemOfRequester : itemOfNoneRequester}
                styles={{
                    content: {
                        backgroundColor: "#fff",
                        borderRadius:
                            i18next.language === "ar"
                                ? "16px 0 16px 16px"
                                : "0 16px 16px 16px",
                    },
                }}
            />
        </div>
    );
};

export default Profile;
