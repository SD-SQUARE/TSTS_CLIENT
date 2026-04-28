import { useMemo, useState } from "react";
import {
    Button,
    Card,
    Empty,
    Flex,
    Input,
    List,
    Modal,
    Space,
    Spin,
    Typography,
    message as appMessage,
} from "antd";
import { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
    useCreateQuickMessageMutation,
    useGetQuickMessagesQuery,
    type QuickMessage,
} from "../../tickets/store/services/chatApi";
import i18next from "i18next";
import { getErrorMessage } from "../../../utils/error";

const { Text, Title } = Typography;
const { TextArea } = Input;

const stripHtml = (content?: string | null) =>
    (content || "")
        .replace(/<(.|\n)*?>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

const QuickMessages = ({ searchTerm = "" }: { searchTerm?: string }) => {
    const { t } = useTranslation();
    const { data: quickMessages = [], isLoading } = useGetQuickMessagesQuery();
    const [createQuickMessage, { isLoading: isCreating }] = useCreateQuickMessageMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [titleEn, setTitleEn] = useState("");
    const [titleAr, setTitleAr] = useState("");
    const [contentEn, setContentEn] = useState("");
    const [contentAr, setContentAr] = useState("");

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredMessages = useMemo(() => {
        if (!normalizedSearch) {
            return quickMessages;
        }

        return quickMessages.filter((item) =>
            [item.title_en, item.title_ar, item.content_en, item.content_ar]
                .join(" ")
                .toLowerCase()
                .includes(normalizedSearch),
        );
    }, [normalizedSearch, quickMessages]);

    const resetModal = () => {
        setIsModalOpen(false);
        setTitleEn("");
        setTitleAr("");
        setContentEn("");
        setContentAr("");
    };

    const getLocalizedTitle = (item: QuickMessage) => {
        if (i18next.language === "ar") {
            return item.title_ar || item.title_en || t("tickets.tools.quickMessages.defaultTitle");
        }

        return item.title_en || item.title_ar || t("tickets.tools.quickMessages.defaultTitle");
    };

    const getLocalizedContent = (item: QuickMessage) => {
        if (i18next.language === "ar") {
            return item.content_ar || item.content_en || "";
        }

        return item.content_en || item.content_ar || "";
    };

    const handleCreate = async () => {
        if (!stripHtml(contentEn) || !stripHtml(contentAr)) {
            appMessage.warning(t("tickets.tools.quickMessages.validation"));
            return;
        }

        try {
            await createQuickMessage({
                title_en: titleEn.trim() || undefined,
                title_ar: titleAr.trim() || undefined,
                content_en: contentEn.trim(),
                content_ar: contentAr.trim(),
            }).unwrap();

            appMessage.success(t("tickets.tools.quickMessages.saved"));
            resetModal();
        } catch (error) {
            appMessage.error(getErrorMessage(error, t("errors.submitFailed")));
        }
    };

    return (
        <>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card
                    style={{
                        borderRadius: 16,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                    }}
                >
                    <Flex justify="space-between" align="center" gap={16} wrap>
                        <Space direction="vertical" size={4}>
                            <Title level={5} style={{ margin: 0 }}>
                                {t("tickets.tools.quickMessages.title")}
                            </Title>
                            <Text type="secondary">
                                {t("tickets.tools.quickMessages.description")}
                            </Text>
                        </Space>

                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                            {t("tickets.tools.quickMessages.new")}
                        </Button>
                    </Flex>
                </Card>

                <Card
                    style={{
                        borderRadius: 16,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                    }}
                >
                    {isLoading ? (
                        <Flex justify="center" style={{ padding: "32px 0" }}>
                            <Spin />
                        </Flex>
                    ) : filteredMessages.length ? (
                        <List
                            dataSource={filteredMessages}
                            renderItem={(item) => (
                                <List.Item>
                                    <Card
                                        size="small"
                                        style={{
                                            width: "100%",
                                            borderRadius: 14,
                                            border: "1px solid #eef2ff",
                                        }}
                                    >
                                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                            <Flex align="center" gap={8}>
                                                <MessageOutlined style={{ color: "var(--color-primary)" }} />
                                                <Text strong>{getLocalizedTitle(item)}</Text>
                                            </Flex>
                                            <Text type="secondary">
                                                {getLocalizedContent(item)}
                                            </Text>
                                        </Space>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t("tickets.tools.quickMessages.empty")}
                        />
                    )}
                </Card>
            </Space>

            <Modal
                title={t("tickets.tools.quickMessages.modalTitle")}
                open={isModalOpen}
                onCancel={resetModal}
                onOk={() => void handleCreate()}
                confirmLoading={isCreating}
                okText={t("tickets.tools.quickMessages.save")}
            >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Input
                        value={titleEn}
                        onChange={(event) => setTitleEn(event.target.value)}
                        placeholder={t("tickets.tools.quickMessages.titlePlaceholderEn")}
                        maxLength={120}
                        dir="ltr"
                    />
                    <TextArea
                        rows={5}
                        value={contentEn}
                        onChange={(event) => setContentEn(event.target.value)}
                        placeholder={t("tickets.tools.quickMessages.contentPlaceholderEn")}
                        dir="ltr"
                    />
                    <Input
                        value={titleAr}
                        onChange={(event) => setTitleAr(event.target.value)}
                        placeholder={t("tickets.tools.quickMessages.titlePlaceholderAr")}
                        maxLength={120}
                        dir="rtl"
                    />
                    <TextArea
                        rows={5}
                        value={contentAr}
                        onChange={(event) => setContentAr(event.target.value)}
                        placeholder={t("tickets.tools.quickMessages.contentPlaceholderAr")}
                        dir="rtl"
                    />
                </Space>
            </Modal>
        </>
    );
};

export default QuickMessages;
