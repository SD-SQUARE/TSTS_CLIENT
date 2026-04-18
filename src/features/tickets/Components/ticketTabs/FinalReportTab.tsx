/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Flex,
  Image,
  Input,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  LinkOutlined,
  RobotOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';
import {
  useTicketFinalReport,
  useUpsertTicketFinalReport,
  useUploadTicketFinalReportMedia,
} from '../../Hooks/useTicketFinalReport';
import type { FinalReportAttachment } from '../../Types/finalReport';

const isImageFile = (mime?: string | null) => Boolean(mime?.startsWith('image/'));
const isVideoFile = (mime?: string | null) => Boolean(mime?.startsWith('video/'));
const isAudioFile = (mime?: string | null) => Boolean(mime?.startsWith('audio/'));
const isPdfFile = (mime?: string | null) => mime === 'application/pdf';

const AttachmentPreview: React.FC<{ item: FinalReportAttachment; labelOpen: string }> = ({
  item,
  labelOpen,
}) => {
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
        <Typography.Text type="secondary">{item.mime || labelOpen}</Typography.Text>
      </Flex>
    );
  };

  return (
    <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden' }}>
      {renderPreview()}
      <Flex vertical gap={8} style={{ padding: 12 }}>
        <Typography.Text strong>{item.fileName}</Typography.Text>
        <Flex justify="space-between" align="center" gap={8}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {item.mime || labelOpen}
          </Typography.Text>
          <Button
            size="small"
            icon={<LinkOutlined />}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {labelOpen}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    ['link', 'image'],
    ['clean'],
  ],
};

const TicketFinalReportTab: React.FC = () => {
  const { t } = useTranslation();
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading } = useTicketFinalReport(ticketId);
  const saveMutation = useUpsertTicketFinalReport(ticketId);
  const uploadMutation = useUploadTicketFinalReportMedia(ticketId);

  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');

  useEffect(() => {
    setTitleEn(report?.title_en || '');
    setTitleAr(report?.title_ar || '');
    setContentEn(report?.content_en || '');
    setContentAr(report?.content_ar || '');
  }, [report]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        title_en: titleEn,
        title_ar: titleAr,
        content_en: contentEn,
        content_ar: contentAr,
      });
      message.success(t('tickets.finalReport.messages.saved'));
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('errors.submitFailed'));
    }
  };

  const handleUpload = async (options: any) => {
    const formData = new FormData();
    formData.append('files', options.file);

    try {
      await uploadMutation.mutateAsync(formData);
      message.success(t('tickets.finalReport.messages.uploaded'));
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('errors.uploadFailed'));
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" style={{ paddingTop: 64 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={16} style={{ padding: 8 }}>
      <Card style={{ borderRadius: 18 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('tickets.finalReport.title')}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t('tickets.finalReport.subtitle')}
            </Typography.Text>
          </div>

          <Space wrap>
            {report?.publishedKnowledgeItemId && (
              <Tag color="green">{t('tickets.finalReport.published')}</Tag>
            )}
            <Button
              icon={<RobotOutlined />}
              disabled={!report?.id}
              onClick={() => navigate(`/knowledge-base/generator/${report?.id}`)}
            >
              {t('tickets.finalReport.openGenerator')}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saveMutation.isPending}
              onClick={() => void handleSave()}
            >
              {t('common.save')}
            </Button>
          </Space>
        </Flex>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <Card title={t('knowledge.languages.english')} style={{ borderRadius: 18 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              placeholder={t('tickets.finalReport.fields.titleEn')}
              dir="ltr"
            />
            <div>
              <Typography.Text type="secondary">
                {t('tickets.finalReport.fields.contentEn')}
              </Typography.Text>
              <ReactQuill
                theme="snow"
                modules={editorModules}
                value={contentEn}
                onChange={setContentEn}
                style={{ marginTop: 8, direction: 'ltr' }}
              />
            </div>
          </Space>
        </Card>

        <Card title={t('knowledge.languages.arabic')} style={{ borderRadius: 18 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input
              value={titleAr}
              onChange={(event) => setTitleAr(event.target.value)}
              placeholder={t('tickets.finalReport.fields.titleAr')}
              dir="rtl"
              style={{ textAlign: 'right' }}
            />
            <div>
              <Typography.Text type="secondary">
                {t('tickets.finalReport.fields.contentAr')}
              </Typography.Text>
              <ReactQuill
                theme="snow"
                modules={editorModules}
                value={contentAr}
                onChange={setContentAr}
                style={{ marginTop: 8, direction: 'rtl' }}
              />
            </div>
          </Space>
        </Card>
      </div>

      <Card title={t('tickets.finalReport.attachments')} style={{ borderRadius: 18 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <Typography.Text type="secondary">
              {t('tickets.finalReport.attachmentsHint')}
            </Typography.Text>
            <Upload showUploadList={false} customRequest={handleUpload} multiple>
              <Button icon={<UploadOutlined />} loading={uploadMutation.isPending}>
                {t('tickets.tools.attachmentsUpload')}
              </Button>
            </Upload>
          </Flex>

          {report?.attachments?.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {report.attachments.map((item) => (
                <AttachmentPreview
                  key={item.id}
                  item={item}
                  labelOpen={t('tickets.tools.attachmentsOpen')}
                />
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('tickets.finalReport.noAttachments')}
            />
          )}
        </Space>
      </Card>
    </Flex>
  );
};

export default TicketFinalReportTab;
