import { Tabs } from "antd";
import ProfileTab from "./components/tabs/ProfileTab.component";
import GroupsTab from "./components/tabs/GroupsTab.component";
import SpecializationsTab from "./components/tabs/SpecializationsTab.component";
import SettingsTab from "./components/tabs/SettingsTab.component";

const Profile = () => {
    return (
        <div style={{
            padding: "1rem",
        }}>
            <Tabs
                type="card"
                defaultActiveKey="profile"
                items={[
                    {
                        key: "profile",
                        label: "Profile",
                        children: <ProfileTab />,
                    },
                    {
                        key: "groups",
                        label: "Groups",
                        children: <GroupsTab />,
                    },
                    {
                        key: "specializations",
                        label: "Specializations",
                        children: <SpecializationsTab />,
                    },
                    {
                        key: "settings",
                        label: "Settings",
                        children: <SettingsTab />,
                    },
                ]}
                styles={{
                    header: {
                        marginBottom: "0rem",
                    },
                    content: {
                        backgroundColor: "#fff",
                        borderRadius: "0 16px 16px 16px"
                    },
                }}
            />
        </div>
    );
};

export default Profile;
