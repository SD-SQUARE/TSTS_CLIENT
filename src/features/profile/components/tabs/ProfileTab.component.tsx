import { Card, Col, Row } from "antd";
import Contacts from "../Contacts.component";
import Departments from "../Departments.component";
import OrganizationInfo from "../OrganizationInfo.component";
import PersonalInfo from "../PersonalInfo.component";
import ProfileHeader from "../ProfileHeader.component";
import { useUserProfile } from "../../hooks/useUserProfile.hook";
import { useSelector } from "react-redux";
import i18next from "i18next";
import { useMemo, useState } from "react";
import UserFormModal from "../../../Users/Components/UsersFormModal";
import type { UserListItem } from "../../../Users/Types/users";
import ProfileImageModal from "../ProfileImageModal.component";

const getEditableRole = (role?: string) => {
    switch ((role || "").toLowerCase()) {
        case "admin":
        case "superadmin":
            return "admins";
        case "technician":
            return "technicians";
        case "requester":
            return "requesters";
        default:
            return null;
    }
};

const ProfileTab = () => {
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const editableRole = useMemo(() => getEditableRole(auth.user?.role), [auth.user?.role]);
    const { data: user, refetch } = useUserProfile(userId);

    const editingUser = useMemo(
        () => (user ? ({ id: user.id } as UserListItem) : undefined),
        [user],
    );


    return (
        <>
            <Card
                bordered={false}
                style={{
                    borderRadius: `${i18next.language === "ar" ? '16px 0' : '0 16px'} 16px 16px`,
                    overflow: "hidden",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                }}
            >
                <ProfileHeader
                    user={user}
                    canEditProfile={Boolean(editableRole && user?.allow_profile_edit)}
                    onEditProfile={() => setIsEditModalOpen(true)}
                    onEditImage={() => setIsImageModalOpen(true)}
                />

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

            {editableRole && user?.allow_profile_edit && (
                <UserFormModal
                    isVisible={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        void refetch();
                    }}
                    userData={editingUser}
                    role={editableRole}
                    profileEditMode
                />
            )}

            <ProfileImageModal
                open={isImageModalOpen}
                user={user}
                onClose={() => {
                    setIsImageModalOpen(false);
                    void refetch();
                }}
            />
        </>
    );
};

export default ProfileTab;

