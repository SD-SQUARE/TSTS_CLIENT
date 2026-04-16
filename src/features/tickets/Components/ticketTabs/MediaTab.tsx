/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from 'react';
import { Card, Flex, Empty, Spin, Typography, message } from 'antd';
import {
    FileOutlined, FilePdfOutlined, AudioOutlined,
    FilePptOutlined, DownloadOutlined, PictureOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useTicketMedia } from '../../Hooks/useTicket';

interface TicketMediaTabProps {
    media: any[] | undefined;
    isLoading: boolean;
}

const TicketMediaTab: React.FC<TicketMediaTabProps> = () => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();
    const { data: media, isLoading, refetch } = useTicketMedia(ticketId);

    const isImage = (mime: string) => mime?.startsWith('image/');

    useEffect(() => {
        refetch();
    }, [refetch]);


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

    const handleDownload = async (
        e: React.MouseEvent,
        url: string,
        fileName: string
    ) => {
        e.stopPropagation();
        const hide = message.loading(t('common.downloading'), 0);
    
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            hide();
        } catch (error) {
            console.error('Download failed:', error);
            message.error(t('errors.downloadFailed'));
            hide();
        }
    };


    if (isLoading) return <Spin style={{ display: 'block', margin: '50px auto' }} />;
    if (!media || media.length === 0) return <Empty style={{marginTop: "5rem"}} description={t('common.noMedia')} />;

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
                                onClick={(e) => handleDownload(e, item.url, item.fileName)}
                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            >
                                <DownloadOutlined />
                                <Typography.Text>{t('common.download')}</Typography.Text>
                            </div>
                        ]}
                    >
                        <Card.Meta

                            avatar={getMimeIcon(item.fileName.split('.').pop(), '20px')}
                            title={<Typography.Text ellipsis={{ tooltip: item.fileName }}>{item.fileName}</Typography.Text>}
                            description={<Typography.Text type="secondary" style={{ fontSize: '11px' }}>{item.fileName.split('.').pop()}</Typography.Text>}
                        />
                    </Card>
                ))}
            </Flex>
        </div>
    );
};

export default TicketMediaTab;