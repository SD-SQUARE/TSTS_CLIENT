import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Modal, Space, Typography, Upload, message } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { User } from "../interfaces/user.interface";
import { useUpdateProfileImage } from "../../Users/Hooks/useUsers";
import { getErrorMessage } from "../../../utils/error";

const { Text } = Typography;

const ProfileImageModal = ({
    open,
    user,
    onClose,
}: {
    open: boolean;
    user?: User;
    onClose: () => void;
}) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const updateImageMutation = useUpdateProfileImage(user?.id);

    useEffect(() => {
        if (!open) {
            setFile(null);
        }
    }, [open]);

    const previewSrc = useMemo(() => {
        if (file) {
            return URL.createObjectURL(file);
        }

        return user?.image ?? undefined;
    }, [file, user?.image]);

    useEffect(() => {
        return () => {
            if (previewSrc && file) {
                URL.revokeObjectURL(previewSrc);
            }
        };
    }, [file, previewSrc]);

    const handleSubmit = async () => {
        if (!file) {
            message.warning(t("profile.actions.selectImage"));
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await updateImageMutation.mutateAsync(formData);
            message.success(
                response?.data?.message || t("profile.actions.imageUpdated"),
            );
            onClose();
        } catch (error: any) {
            message.error(
                getErrorMessage(error, t("profile.actions.imageUpdateFailed")),
            );
        }
    };

    return (
        <Modal
            open={open}
            title={t("profile.actions.changeImage")}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Space direction="vertical" size={20} style={{ width: "100%", alignItems: "center" }}>
                <Avatar
                    size={120}
                    src={previewSrc}
                    style={{ background: "#f0f5ff", color: "#1677ff" }}
                >
                    {user?.first_name_en?.[0] ?? "U"}
                </Avatar>

                <Text type="secondary" style={{ textAlign: "center" }}>
                    {t("profile.actions.changeImageHint")}
                </Text>

                <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(nextFile) => {
                        setFile(nextFile);
                        return false;
                    }}
                >
                    <Button icon={<CameraOutlined />}>
                        {t("profile.actions.selectImage")}
                    </Button>
                </Upload>

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button onClick={onClose}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={updateImageMutation.isPending}
                    >
                        {t("common.save")}
                    </Button>
                </Space>
            </Space>
        </Modal>
    );
};

export default ProfileImageModal;
