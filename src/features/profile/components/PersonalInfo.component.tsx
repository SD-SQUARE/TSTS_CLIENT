import { Col, Row, Tooltip, Typography } from "antd";
import { MailOutlined, IdcardOutlined } from "@ant-design/icons";
import InfoItem from "./InfoItem.component";
import type { User } from "../interfaces/user.interface";

const { Title, Text } = Typography;

const PersonalInfo = ({ user }: { user: User }) => {
    return (
        <>
            <Title level={5}>Personal Information</Title>

            <Row gutter={[16, 16]}>

                {/* Arabic Name */}
                <Col xs={24}>
                    <InfoItem
                        icon={<IdcardOutlined />}
                        label="Arabic Name"
                        value={`${user?.first_name_ar} ${user?.mid_name_ar} ${user?.last_name_ar}`}
                    />
                </Col>

                {/* Email */}
                <Col xs={24} sm={12}>
                    <InfoItem
                        icon={<MailOutlined />}
                        label="Email"
                        value={
                            <Tooltip title={user?.email}>
                                <Text
                                    ellipsis={{
                                        tooltip: user?.email, // Tooltip on overflow
                                    }}
                                    copyable={{ text: user?.email }}
                                    style={{ minWidth: 0, display: "block" }}
                                >
                                    {user?.email}
                                </Text>
                            </Tooltip>
                        }
                    />
                </Col>

                {/* SSN */}
                <Col xs={24} sm={12}>
                    <InfoItem
                        icon={<IdcardOutlined />}
                        label="SSN"
                        value={
                            <Tooltip title={user?.ssn}>
                                <Text
                                    ellipsis={{
                                        tooltip: user?.ssn,
                                    }}
                                    copyable={{ text: user?.ssn }}
                                    style={{ minWidth: 0, display: "block" }}
                                >
                                    {user?.ssn}
                                </Text>
                            </Tooltip>
                        }
                    />
                </Col>

            </Row>
        </>
    );
};

export default PersonalInfo;
