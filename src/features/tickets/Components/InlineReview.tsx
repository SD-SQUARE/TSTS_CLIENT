import React from 'react';
import { Card, Form, Rate, Flex, Typography, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTicketReview } from '../Hooks/useTicketForm';
import ReactQuill from 'react-quill-new';

interface InlineReviewProps {
    ticketId: string;
    btnStyle?: React.CSSProperties;
}

const InlineReview: React.FC<InlineReviewProps> = ({ ticketId, btnStyle }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const postReviewMutation = useTicketReview(ticketId);

    const handleReviewSubmit = async () => {
        try {
            const values = await form.validateFields();
            const isContentEmpty = values.note?.replace(/<(.|\n)*?>/g, '').trim().length === 0;
            const payload = {
                ...values,
                note: isContentEmpty ? "" : values.note
            };

            await postReviewMutation.mutateAsync(payload);
            message.success(t('tickets.reviewSubmitted'));
            form.resetFields();
        } catch (error) {
            console.error("Review submission failed:", error);
        }
    };

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };


    return (
        <Card
            title={<Typography.Text strong>{t('tickets.rateExperience')}</Typography.Text>}
            size="small"
            style={{ borderTop: '2px solid' }}
        >
            <Form form={form} layout="vertical" onFinish={handleReviewSubmit}>
                <Flex vertical align="center" gap="small" style={{ marginBottom: 12 }}>
                    <Form.Item name="rating" rules={[{ required: true }]} noStyle initialValue={5}>
                        <Rate />
                    </Form.Item>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {t('tickets.howWasService')}
                    </Typography.Text>
                </Flex>

                <Form.Item
                    name="note"
                    trigger="onChange"
                    validateTrigger="onBlur"
                >
                    <ReactQuill
                        className="review-quill"
                        theme="snow"
                        modules={modules}
                        placeholder={t('tickets.feedbackPlaceholder')}
                    />
                </Form.Item>

                <Button
                    style={btnStyle}
                    type="primary"
                    block
                    onClick={handleReviewSubmit}
                    loading={postReviewMutation.isPending}
                >
                    {t('common.submit')}
                </Button>
            </Form>
        </Card>
    );
};

export default InlineReview;