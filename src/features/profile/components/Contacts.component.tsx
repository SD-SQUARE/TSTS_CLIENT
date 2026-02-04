import { Col, Row, Typography, Space, Tag, Tooltip } from "antd";
import { PhoneOutlined, MobileOutlined, CopyOutlined } from "@ant-design/icons";
import InfoItem from "./InfoItem.component";
import type { User } from "../interfaces/user.interface";

const { Title } = Typography;

const Contacts = ({ user }: { user: User }) => {
    return (
        <>
            <Title level={5}>Contacts</Title>

            <Row gutter={[16, 16]}>
                {/* Phones */}
                <Col xs={24} sm={12}>
                    <InfoItem
                        icon={<PhoneOutlined />}
                        label="Phones"
                        value={
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {user?.contacts.phones.map((phone, idx) => (
                                    <Tooltip key={idx} title="Click to copy">
                                        <Tag
                                            color="blue"
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: 999,
                                                padding: "4px 12px",
                                                userSelect: "none",
                                            }}
                                            onClick={() => navigator.clipboard.writeText(phone)}
                                        >
                                            {phone} <CopyOutlined style={{ fontSize: 12 }} />
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
                        label="Mobiles"
                        value={
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {user?.contacts.mobiles.map((mobile, idx) => (
                                    <Tooltip key={idx} title="Click to copy">
                                        <Tag
                                            color="green"
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: 999,
                                                padding: "4px 12px",
                                                userSelect: "none",
                                            }}
                                            onClick={() => navigator.clipboard.writeText(mobile)}
                                        >
                                            {mobile} <CopyOutlined style={{ fontSize: 12 }} />
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
