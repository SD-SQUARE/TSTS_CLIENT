import { Col, Row, Tooltip, Typography } from "antd";
import { MailOutlined, IdcardOutlined } from "@ant-design/icons";
import InfoItem from "./InfoItem.component";
import type { User } from "../interfaces/user.interface";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const PersonalInfo = ({ user }: { user: User }) => {
    const { t } = useTranslation();
    return (
        <>
            <Title level={5}>{t("profile.personal.title") }</Title>

            <Row gutter={[16, 16]}>

                {/* Arabic Name */}
                <Col xs={24}>
                    <InfoItem
                        icon={<IdcardOutlined />}
                        label={t("profile.personal.arabicName")}
                        value={`${user?.first_name_ar} ${user?.mid_name_ar} ${user?.last_name_ar}`}
                    />
                </Col>

                {/* English Name */}
                <Col xs={24}>
                    <InfoItem
                        icon={<IdcardOutlined />}
                        label={t("profile.personal.englishName")}
                        value={`${user?.first_name_en} ${user?.mid_name_en} ${user?.last_name_en}`}
                    />
                </Col>

                {/* Email */}
                <Col xs={24} sm={12}>
                    <InfoItem
                        icon={<MailOutlined />}
                        label={t("profile.personal.email")}
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
                        label={t("profile.personal.ssn")}
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
