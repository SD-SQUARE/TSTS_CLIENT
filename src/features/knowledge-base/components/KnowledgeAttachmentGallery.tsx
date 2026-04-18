import React from 'react';
import { Button, Card, Empty, Flex, Image, Typography } from 'antd';
import {
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  LinkOutlined,
} from '@ant-design/icons';

export type KnowledgeAttachment = {
  id: string;
  fileName: string;
  mime: string | null;
  url: string;
};

const isImageFile = (mime?: string | null) => Boolean(mime?.startsWith('image/'));
const isVideoFile = (mime?: string | null) => Boolean(mime?.startsWith('video/'));
const isAudioFile = (mime?: string | null) => Boolean(mime?.startsWith('audio/'));
const isPdfFile = (mime?: string | null) => mime === 'application/pdf';

type KnowledgeAttachmentGalleryProps = {
  attachments?: KnowledgeAttachment[];
  emptyText: string;
  openLabel: string;
};

const KnowledgeAttachmentGallery: React.FC<KnowledgeAttachmentGalleryProps> = ({
  attachments = [],
  emptyText,
  openLabel,
}) => {
  if (!attachments.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={emptyText}
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}
    >
      {attachments.map((item) => {
        const previewHeight = 180;

        const renderPreview = () => {
          if (isImageFile(item.mime)) {
            return (
              <Image
                src={item.url}
                alt={item.fileName}
                style={{ width: '100%', height: previewHeight, objectFit: 'cover' }}
              />
            );
          }

          if (isPdfFile(item.mime)) {
            return (
              <iframe
                title={item.fileName}
                src={item.url}
                style={{ width: '100%', height: previewHeight, border: 'none' }}
              />
            );
          }

          if (isVideoFile(item.mime)) {
            return (
              <video controls style={{ width: '100%', height: previewHeight, background: '#000' }}>
                <source src={item.url} type={item.mime || undefined} />
              </video>
            );
          }

          if (isAudioFile(item.mime)) {
            return (
              <Flex
                vertical
                justify="center"
                align="center"
                gap={12}
                style={{ height: previewHeight, padding: 16, background: '#f7f9fc' }}
              >
                <FileOutlined style={{ fontSize: 32, color: '#1d4ed8' }} />
                <audio controls style={{ width: '100%' }}>
                  <source src={item.url} type={item.mime || undefined} />
                </audio>
              </Flex>
            );
          }

          return (
            <Flex
              vertical
              justify="center"
              align="center"
              gap={12}
              style={{ height: previewHeight, padding: 16, background: '#f7f9fc' }}
            >
              {isPdfFile(item.mime) ? (
                <FilePdfOutlined style={{ fontSize: 36, color: '#dc2626' }} />
              ) : isImageFile(item.mime) ? (
                <FileImageOutlined style={{ fontSize: 36, color: '#1d4ed8' }} />
              ) : (
                <FileOutlined style={{ fontSize: 36, color: '#475569' }} />
              )}
              <Typography.Text type="secondary">{item.mime || openLabel}</Typography.Text>
            </Flex>
          );
        };

        return (
          <Card
            key={item.id}
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            {renderPreview()}
            <Flex vertical gap={8} style={{ padding: 12 }}>
              <Typography.Text strong>{item.fileName}</Typography.Text>
              <Flex justify="space-between" align="center" gap={8}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {item.mime || openLabel}
                </Typography.Text>
                <Button
                  size="small"
                  icon={<LinkOutlined />}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {openLabel}
                </Button>
              </Flex>
            </Flex>
          </Card>
        );
      })}
    </div>
  );
};

export default KnowledgeAttachmentGallery;
