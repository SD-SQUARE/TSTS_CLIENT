import React from 'react';
import { Modal, Form, Rate, Input, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTicketReview } from '../Hooks/useTicketForm';


interface Props {
    ticketId: string;
    open: boolean;
    onClose: () => void;
}

const PostReviewModal: React.FC<Props> = ({ ticketId, open, onClose }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const postReviewMutation = useTicketReview(ticketId);

    const isSubmitting = postReviewMutation.isPending;
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await postReviewMutation.mutateAsync(values);
            form.resetFields();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <Modal
            title={t('tickets.rateExperience')}
            open={open}
            onOk={handleSubmit}
            onCancel={onClose}
            confirmLoading={isSubmitting}
            okText={t('common.submit')}
            cancelText={t('common.cancel')}
            destroyOnClose
            maskClosable={false}
            keyboard={false}
            closable={true}
            // footer = { (_, {OkBtn}) => <OkBtn/>}
        >
            <Form form={form} layout="vertical" initialValues={{ rating: 5 }}>
                <Flex vertical align="center" style={{ marginBottom: 24, marginTop: 12 }}>
                    <Typography.Text type="secondary" style={{ marginBottom: 8 }}>
                        {t('tickets.howWasService')}
                    </Typography.Text>
                    <Form.Item name="rating" noStyle rules={[{ required: true }]}>
                        <Rate style={{ fontSize: 36 }} />
                    </Form.Item>
                </Flex>

                <Form.Item
                    name="note"
                    label={t('tickets.feedbackNote')}
                    extra={t('tickets.optional')}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder={t('tickets.feedbackPlaceholder')}
                        showCount
                        maxLength={500}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PostReviewModal;