import { Card, Col, Row } from "antd";
import Contacts from "../Contacts.component";
import Departments from "../Departments.component";
import OrganizationInfo from "../OrganizationInfo.component";
import PersonalInfo from "../PersonalInfo.component";
import ProfileHeader from "../ProfileHeader.component";
import { useUserProfile } from "../../hooks/useUserProfile.hook";
import { useSelector } from "react-redux";


const ProfileTab = () => {
    
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";
    
    const { data: user, isLoading } = useUserProfile(userId);


    return (
        <Card
            bordered={false}
            style={{
                borderRadius: "0 16px 16px 16px",
                overflow: "hidden",
                boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
            }}
        >
            <ProfileHeader user={user} />

            <div style={{ padding: 32 }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={16}>
                        <PersonalInfo user={user} />
                    </Col>

                    <Col xs={24} md={8}>
                        <OrganizationInfo user={user} />
                    </Col>

                    <Col xs={24}>
                        <Departments user={user} />
                    </Col>

                    <Col xs={24}>
                        <Contacts user={user} />
                    </Col>
                </Row>
            </div>
        </Card>
    );
};

export default ProfileTab;
