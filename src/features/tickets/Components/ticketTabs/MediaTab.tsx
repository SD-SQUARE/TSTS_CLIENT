/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card, Flex, Empty, Spin, Typography, message } from 'antd';
import {
    FileOutlined, FilePdfOutlined, AudioOutlined,
    FilePptOutlined, DownloadOutlined, PictureOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import api from '../../../../api/http';

interface TicketMediaTabProps {
    media: any[] | undefined;
    isLoading: boolean;
}

const TicketMediaTab: React.FC<TicketMediaTabProps> = ({ media, isLoading }) => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();

    const isImage = (mime: string) => mime?.startsWith('image/');


    const getMimeIcon = (mime: string, fontSize = '24px') => {
        if (mime.includes('pdf')) return <FilePdfOutlined style={{ fontSize, color: '#ff4d4f' }} />;
        if (mime.includes('audio')) return <AudioOutlined style={{ fontSize, color: '#1890ff' }} />;
        if (mime.includes('presentation')) return <FilePptOutlined style={{ fontSize, color: '#fa8c16' }} />;
        if (isImage(mime)) return <PictureOutlined style={{ fontSize, color: '#52c41a' }} />;
        return <FileOutlined style={{ fontSize }} />;
    };

    const handleViewMedia = (url: string) => {
        if (url) window.open(url, '_blank');
    };

    const handleDownload = async (e: React.MouseEvent, aid: string, fileName: string) => {
        e.stopPropagation();
        try {
            const response = await api.get(`/api/v1/tickets/${ticketId}/media/${aid}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            message.error(t('errors.downloadFailed'));
        }
    };

    if (isLoading) return <Spin style={{ display: 'block', margin: '50px auto' }} />;
    if (!media || media.length === 0) return <Empty description={t('common.noMedia')} />;

    return (
        <div style={{ padding: '16px' }}>
            <Flex gap="large" wrap="wrap">
                {media.map((item: any) => (
                    <Card
                        key={item.id}
                        hoverable
                        style={{ width: 240, borderRadius: '8px', overflow: 'hidden' }}
                        onClick={() => handleViewMedia(item.url)}
                        cover={
                            isImage(item.mime) ? (
                                <div style={{ height: 140, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img alt={item.name} src={item.url} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div style={{ height: 140, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    { }
                                    {getMimeIcon(item.mime, '48px')}
                                </div>
                            )
                        }
                        actions={[
                            <div
                                key="download"
                                onClick={(e) => handleDownload(e, item.id, item.name)}
                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            >
                                <DownloadOutlined />
                                <Typography.Text>{t('common.download')}</Typography.Text>
                            </div>
                        ]}
                    >
                        <Card.Meta

                            avatar={getMimeIcon(item.mime, '20px')}
                            title={<Typography.Text ellipsis={{ tooltip: item.name }}>{item.name}</Typography.Text>}
                            description={<Typography.Text type="secondary" style={{ fontSize: '11px' }}>{item.mime}</Typography.Text>}
                        />
                    </Card>
                ))}
            </Flex>
        </div>
    );
};

export default TicketMediaTab;