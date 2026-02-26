import { Col, Row, Typography, Space, Tag, Tooltip } from "antd";
import { PhoneOutlined, MobileOutlined, CopyOutlined } from "@ant-design/icons";
import InfoItem from "./InfoItem.component";
import type { User } from "../interfaces/user.interface";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const Contacts = ({ user }: { user: User }) => {
    
    const { t } = useTranslation();
    return (
        <>
            <Title level={5}>{t("profile.contacts.title") }</Title>

            <Row gutter={[16, 16]}>
                {/* Phones */}
                <Col xs={24} sm={12}>
                    <InfoItem
                        icon={<PhoneOutlined />}
                        label={t("profile.contacts.phones")}
                        value={
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {user?.contacts.phones.map((phone, idx) => (
                                    <Tooltip key={idx} title={`${t("profile.contacts.copy")} ${phone}`}>
                                        <Tag
                                            color="blue"
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: 999,
                                                padding: "4px 12px",
                                                userSelect: "none",
                                            }}
                                            // onClick={() => navigator.clipboard.writeText(phone)}
                                        >
                                            {/* {phone} <CopyOutlined style={{ fontSize: 12 }} /> */}
                                            <Typography.Text copyable>
                                                {phone}
                                            </Typography.Text>
                                        </Tag>
                                    </Tooltip>
                                ))}
                            </Space>
                        }
                    />
                </Col>

                {/* Mobiles */}
                <Col xs={24} sm={12}>
                    <InfoItem
                        icon={<MobileOutlined />}
                        label={t("profile.contacts.mobiles")}
                        value={
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {user?.contacts.mobiles.map((mobile, idx) => (
                                    <Tooltip key={idx} title={`${t("profile.contacts.copy")} ${mobile}`}>
                                        <Tag
                                            color="green"
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: 999,
                                                padding: "4px 12px",
                                                userSelect: "none",
                                            }}
                                            // onClick={() => navigator.clipboard.writeText(mobile)}
                                        >
                                            {/* {mobile} <CopyOutlined style={{ fontSize: 12 }} /> */}
                                            <Typography.Text copyable>
                                                {mobile}
                                            </Typography.Text>
                                        </Tag>
                                    </Tooltip>
                                ))}
                            </Space>
                        }
                    />
                </Col>
            </Row>
        </>
    );
};

export default Contacts;
