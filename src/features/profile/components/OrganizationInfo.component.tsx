import { Space, Typography } from "antd";
import { BankOutlined, ApartmentOutlined } from "@ant-design/icons";
import InfoItem from "./InfoItem.component";
import type { User } from "../interfaces/user.interface";

const { Title } = Typography;

const OrganizationInfo = ({ user }: { user: User }) => {
    return (
        <>
            <Title level={5}>Organization</Title>

            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <InfoItem
                    icon={<BankOutlined />}
                    label="University"
                    value={user?.university.name}
                />

                <InfoItem
                    icon={<ApartmentOutlined />}
                    label="Domain"
                    value={user?.domain.name}
                />
            </Space>
        </>
    );
};

export default OrganizationInfo;
