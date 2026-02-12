/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { List, Avatar, Rate, Typography, Empty, Space } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface Props {
    reviews: any[];
    isLoading: boolean;
}

const TicketReviewsTab: React.FC<Props> = ({ reviews, isLoading }) => {
    const { t } = useTranslation();

    return (
        <div style={{ padding: '24px 0' }}>
            <List
                loading={isLoading}
                dataSource={reviews}
                locale={{ emptyText: <Empty description={t('tickets.noReviews')} /> }}
                renderItem={(item) => (
                    <List.Item key={item.id} style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
                        <List.Item.Meta
                            avatar={<Avatar src={item.reviewer?.image} size="large" />}
                            title={
                                <Space direction="vertical" size={0}>
                                    <Typography.Text strong>
                                        {item.reviewer?.firstName} {item.reviewer?.lastName}
                                    </Typography.Text>
                                    <Rate disabled defaultValue={item.rating > 5 ? 5 : item.rating} style={{ fontSize: 14 }} />
                                </Space>
                            }
                            description={
                                <div style={{ marginTop: 8 }}>
                                    <Typography.Paragraph type="secondary" style={{ fontSize: '12px', marginBottom: 4 }}>
                                        {dayjs(item.createdAt).format('YYYY-MM-DD h:mm A')}
                                    </Typography.Paragraph>
                                    <Typography.Text>
                                        {item.note || <span style={{ fontStyle: 'italic', color: '#bfbfbf' }}>{t('tickets.noComment')}</span>}
                                    </Typography.Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TicketReviewsTab;