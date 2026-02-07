import { Space, Typography } from "antd";
import { BankOutlined, ApartmentOutlined } from "@ant-design/icons";
import InfoItem from "./InfoItem.component";
import type { User } from "../interfaces/user.interface";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const OrganizationInfo = ({ user }: { user: User }) => {
    const { t } = useTranslation();

    return (
        <>
            <Title level={5}>{ t("profile.organization.title") }</Title>

            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <InfoItem
                    icon={<BankOutlined />}
                    label={t("profile.organization.university")}
                    value={user?.university.name}
                />

                <InfoItem
                    icon={<ApartmentOutlined />}
                    label={t("profile.organization.domain")}
                    value={user?.domain.name}
                />
            </Space>
        </>
    );
};

export default OrganizationInfo;
