/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {  Avatar, Rate, Typography, Empty,  Flex, Card, Divider, Spin } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

interface Props {
    reviews: any[];
    isLoading: boolean;
}

const TicketReviewsTab: React.FC<Props> = ({ reviews, isLoading }) => {
    const { t } = useTranslation();

        if (isLoading) {
            return (
                <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
                    <Spin size="large" tip={t('common.loading')} />
                </Flex>
            );
        }
    
        if (!reviews || reviews.length === 0) {
            return (
                <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
                    <Empty description={t('tickets.noReviews')} />
                </Flex>
            );
        }
    
        return (
            <Flex vertical gap="middle" style={{ padding: '24px 0' }}>
                {reviews.map((item) => (
                    <Card 
                        key={item.id} 
                        styles={{ body: { padding: '20px' } }}
                        style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
                    >
                        <Flex gap="large">
                            {/* Left Side: Avatar */}
                            <Avatar 
                                src={item.reviewer?.image} 
                                size={54} 
                                style={{ flexShrink: 0, border: '1px solid #f0f0f0' }} 
                            />
    
                            {/* Right Side: Content */}
                            <Flex vertical style={{ flex: 1 }}>
                                <Flex justify="space-between" align="start">
                                    <Flex vertical>
                                        <Typography.Text strong style={{ fontSize: '16px' }}>
                                            {item.reviewer?.firstName[i18next.language]} {item.reviewer?.lastName[i18next.language]}
                                        </Typography.Text>
                                        <Rate 
                                            disabled 
                                            defaultValue={item.rating > 5 ? 5 : item.rating} 
                                            style={{ fontSize: 12, marginTop: 4 }} 
                                        />
                                    </Flex>
                                    
                                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                        {dayjs(item.createdAt).format('YYYY-MM-DD h:mm A')}
                                    </Typography.Text>
                                </Flex>
    
                                <Divider style={{ margin: '12px 0' }} />
    
                                <Typography.Text style={{ color: '#434343', lineHeight: '1.6' }}>
                                    {item.note || (
                                        <Typography.Text type="secondary" italic style={{ opacity: 0.6 }}>
                                            {t('tickets.noComment')}
                                        </Typography.Text>
                                    )}
                                </Typography.Text>
                            </Flex>
                        </Flex>
                    </Card>
                ))}
            </Flex>
        );
    };
export default TicketReviewsTab;