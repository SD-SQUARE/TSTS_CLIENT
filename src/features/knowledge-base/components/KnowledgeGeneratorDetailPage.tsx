/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import {
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Grid,
  Input,
  Space,
  Spin,
  Splitter,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  SaveOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill-new';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import 'react-quill-new/dist/quill.snow.css';
import {
  useGenerateKnowledgeDraft,
  useKnowledgeGeneratorHistory,
  useKnowledgeGeneratorReport,
  usePublishKnowledgeDraft,
  useUpdateKnowledgeGeneratorReport,
} from '../../tickets/Hooks/useTicketFinalReport';
import type { FinalReportKnowledgeDraft } from '../../tickets/Types/finalReport';
import KnowledgeAttachmentGallery from './KnowledgeAttachmentGallery';
import { useUsersLookup } from '../../communications/hooks/useCommunicationApi';

const { RangePicker } = DatePicker;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    ['link', 'image'],
    ['clean'],
  ],
};

const contentCardStyle = (rtl = false) =>
  ({
    borderRadius: 24,
    border: '1px solid #e7edf7',
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)',
    height: '100%',
    direction: rtl ? 'rtl' : 'ltr',
  } as const);

const KnowledgeGeneratorDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { reportId } = useParams();
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm<FinalReportKnowledgeDraft>();
  const [historyActor, setHistoryActor] = useState('');
  const [historyDates, setHistoryDates] = useState<[string | undefined, string | undefined]>([
    undefined,
    undefined,
  ]);

  const { data: report, isLoading } = useKnowledgeGeneratorReport(reportId);
  const historyQuery = useKnowledgeGeneratorHistory(reportId, {
    actor: historyActor,
    startDate: historyDates[0],
    endDate: historyDates[1],
  });
  const historyActorLookup = useUsersLookup(historyActor, historyActor.trim().length > 0);
  const updateMutation = useUpdateKnowledgeGeneratorReport(reportId);
  const generateMutation = useGenerateKnowledgeDraft(reportId);
  const publishMutation = usePublishKnowledgeDraft(reportId);

  useEffect(() => {
    if (report?.knowledgeDraft) {
      form.setFieldsValue(report.knowledgeDraft);
    }
  }, [form, report]);

  const watchedDraft = Form.useWatch([], form) as FinalReportKnowledgeDraft | undefined;
  const draft = watchedDraft || report?.knowledgeDraft || {};

  const localizedTitle = useMemo(
    () =>
      (i18n.language === 'ar'
        ? draft.title_ar || draft.title_en || report?.title_ar || report?.title_en
        : draft.title_en || draft.title_ar || report?.title_en || report?.title_ar) || '',
    [draft, i18n.language, report?.title_ar, report?.title_en],
  );

  const historyActorOptions = useMemo(
    () =>
      (historyActorLookup.data || []).map((item) => ({
        value: item.name_en || item.name_ar || item.email || '',
        label: (
          <Flex align="center" gap={10}>
            {item.image ? (
              <img
                src={item.image}
                alt=""
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <UserOutlined style={{ color: '#0f4c81' }} />
            )}
            <div>
              <Typography.Text strong>
                {i18n.language === 'ar'
                  ? item.name_ar || item.name_en || item.email
                  : item.name_en || item.name_ar || item.email}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                {item.email}
              </Typography.Text>
            </div>
          </Flex>
        ),
      })),
    [historyActorLookup.data, i18n.language],
  );

  const englishPreview = {
    title: draft.title_en || draft.title_ar || report?.title_en || report?.title_ar || '-',
    description:
      draft.description_en || draft.description_ar || report?.ticketTitle || '-',
    specialization:
      draft.specialization_en || draft.specialization_ar || t('knowledge.fields.category_en'),
    content: draft.content_en || report?.content_en || '',
  };

  const arabicPreview = {
    title: draft.title_ar || draft.title_en || report?.title_ar || report?.title_en || '-',
    description:
      draft.description_ar || draft.description_en || report?.ticketTitle || '-',
    specialization:
      draft.specialization_ar || draft.specialization_en || t('knowledge.fields.category_ar'),
    content: draft.content_ar || report?.content_ar || '',
  };

  const saveDraft = async () => {
    const values = await form.validateFields();
    const response = await updateMutation.mutateAsync({ knowledgeDraft: values });
    form.setFieldsValue(response.knowledgeDraft);
    return response;
  };

  const handleSave = async () => {
    try {
      await saveDraft();
      message.success(t('tickets.finalReport.messages.saved'));
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || t('errors.submitFailed'));
      }
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await generateMutation.mutateAsync();
      form.setFieldsValue(response.knowledgeDraft);
      message.success(t('knowledge.generator.messages.generated'));
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('errors.submitFailed'));
    }
  };

  const handlePublish = async () => {
    try {
      await saveDraft();
      const response = await publishMutation.mutateAsync();
      message.success(t('knowledge.generator.messages.published'));
      navigate(`/knowledge-base?article=${response.knowledgeItemId}`);
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('errors.submitFailed'));
    }
  };

  if (isLoading || !report) {
    return (
      <Flex justify="center" style={{ paddingTop: 80 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Card
        style={{
          borderRadius: 28,
          marginBottom: 16,
          background: 'linear-gradient(135deg, #0d2f57 0%, #184f8c 100%)',
          border: 'none',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
        }}
        styles={{ body: { padding: 26 } }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={14}>
          <div>
            <Space wrap size={[8, 8]} style={{ marginBottom: 10 }}>
              <Tag color="blue">{report.publishedKnowledgeItemId ? t('knowledge.generator.status.published') : t('knowledge.generator.status.draft')}</Tag>
              <Tag>#{report.ticketNumber || '-'}</Tag>
              <Tag>{report.author?.name || '-'}</Tag>
            </Space>

            <Typography.Title level={3} style={{ margin: 0, color: '#fff' }}>
              {localizedTitle || t('knowledge.generator.detailTitle')}
            </Typography.Title>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.82)' }}>
              {report.ticketTitle || t('knowledge.generator.previewHint')}
            </Typography.Text>
          </div>

          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/knowledge-base/generator')}>
              {t('common.back')}
            </Button>
            <Button icon={<RobotOutlined />} loading={generateMutation.isPending} onClick={() => void handleGenerate()}>
              {t('knowledge.generator.generateAi')}
            </Button>
            <Button icon={<SaveOutlined />} loading={updateMutation.isPending} onClick={() => void handleSave()}>
              {t('common.save')}
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={publishMutation.isPending}
              onClick={() => void handlePublish()}
            >
              {t('knowledge.generator.publish')}
            </Button>
          </Space>
        </Flex>
      </Card>

      <Splitter style={{ minHeight: 'calc(100vh - 180px)', boxShadow: '0 14px 32px rgba(15, 23, 42, 0.08)' }}>
        <Splitter.Panel defaultSize="46%" min="34%" style={{ padding: 16, overflowY: 'auto', background: '#fff' }}>
          <Tabs
            items={[
              {
                key: 'info',
                label: t('tickets.tabInfo'),
                children: (
                  <Form form={form} layout="vertical">
                    <Tabs
                      items={[
                        {
                          key: 'english',
                          label: t('knowledge.languages.english'),
                          children: (
                            <Card style={{ borderRadius: 22, borderColor: '#e7edf7' }}>
                              <Form.Item name="title_en" label={t('knowledge.fields.title_en')}>
                                <Input placeholder={t('knowledge.fields.title_en_placeholder')} />
                              </Form.Item>
                              <Form.Item
                                name="description_en"
                                label={t('knowledge.fields.summary_en')}
                              >
                                <Input.TextArea rows={3} placeholder={t('knowledge.fields.summary_en_placeholder')} />
                              </Form.Item>
                              <Form.Item
                                name="specialization_en"
                                label={t('knowledge.fields.category_en')}
                              >
                                <Input placeholder={t('knowledge.fields.category_en_placeholder')} />
                              </Form.Item>
                              <Form.Item name="content_en" label={t('knowledge.fields.content_en')}>
                                <ReactQuill theme="snow" modules={modules} style={{ direction: 'ltr' }} />
                              </Form.Item>
                            </Card>
                          ),
                        },
                        {
                          key: 'arabic',
                          label: t('knowledge.languages.arabic'),
                          children: (
                            <Card style={{ borderRadius: 22, borderColor: '#e7edf7' }}>
                              <Form.Item name="title_ar" label={t('knowledge.fields.title_ar')}>
                                <Input
                                  placeholder={t('knowledge.fields.title_ar_placeholder')}
                                  dir="rtl"
                                  style={{ textAlign: 'right' }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="description_ar"
                                label={t('knowledge.fields.summary_ar')}
                              >
                                <Input.TextArea
                                  rows={3}
                                  placeholder={t('knowledge.fields.summary_ar_placeholder')}
                                  dir="rtl"
                                  style={{ textAlign: 'right' }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="specialization_ar"
                                label={t('knowledge.fields.category_ar')}
                              >
                                <Input
                                  placeholder={t('knowledge.fields.category_ar_placeholder')}
                                  dir="rtl"
                                  style={{ textAlign: 'right' }}
                                />
                              </Form.Item>
                              <Form.Item name="content_ar" label={t('knowledge.fields.content_ar')}>
                                <ReactQuill theme="snow" modules={modules} style={{ direction: 'rtl' }} />
                              </Form.Item>
                            </Card>
                          ),
                        },
                        {
                          key: 'attachments',
                          label: t('tickets.finalReport.attachments'),
                          children: (
                            <Card style={{ borderRadius: 22, borderColor: '#e7edf7' }}>
                              <KnowledgeAttachmentGallery
                                attachments={report.attachments}
                                emptyText={t('tickets.finalReport.noAttachments')}
                                openLabel={t('tickets.tools.attachmentsOpen')}
                              />
                            </Card>
                          ),
                        },
                      ]}
                    />
                  </Form>
                ),
              },
              {
                key: 'history',
                label: t('tickets.tabHistory'),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Flex gap={12} wrap="wrap">
                      <AutoComplete
                        options={historyActorOptions}
                        value={historyActor}
                        onChange={setHistoryActor}
                        style={{ minWidth: 240, flex: '1 1 240px' }}
                      >
                        <Input allowClear placeholder={t('knowledge.generator.filters.actor')} />
                      </AutoComplete>
                      <RangePicker
                        onChange={(values) =>
                          setHistoryDates([
                            values?.[0]?.startOf('day').format('YYYY-MM-DD'),
                            values?.[1]?.endOf('day').format('YYYY-MM-DD'),
                          ])
                        }
                      />
                    </Flex>

                    <Table
                      rowKey="id"
                      loading={historyQuery.isLoading}
                      dataSource={historyQuery.data || []}
                      pagination={false}
                      columns={[
                        {
                          title: t('audit.action'),
                          dataIndex: 'action',
                          key: 'action',
                        },
                        {
                          title: t('audit.userName'),
                          key: 'actor',
                          render: (_, record) => record.actor?.name || '-',
                        },
                        {
                          title: t('audit.createdAt'),
                          key: 'createdAt',
                          render: (_, record) =>
                            record.createdAt
                              ? dayjs(record.createdAt).format('YYYY-MM-DD hh:mm A')
                              : '-',
                        },
                      ]}
                    />
                  </Space>
                ),
              },
            ]}
          />
        </Splitter.Panel>

        <Splitter.Panel
          defaultSize="54%"
          min="35%"
          style={{
            padding: 16,
            overflowY: 'auto',
            background: 'linear-gradient(180deg, #f6f9fd 0%, #eef3fb 100%)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card style={{ borderRadius: 24, borderColor: '#e7edf7' }}>
              <Flex justify="space-between" wrap="wrap" gap={12}>
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {t('knowledge.view_title')}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {t('knowledge.generator.previewHint')}
                  </Typography.Text>
                </div>

                <Space wrap size={[8, 8]}>
                  <Tag color="blue">{report.author?.name || '-'}</Tag>
                  <Tag>{report.updatedAt ? dayjs(report.updatedAt).format('YYYY-MM-DD hh:mm A') : '-'}</Tag>
                  {report.attachments.length > 0 && <Tag>{`${report.attachments.length} ${t('tickets.finalReport.attachments')}`}</Tag>}
                </Space>
              </Flex>
            </Card>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: screens.xxl ? '1fr 1fr' : '1fr',
                gap: 16,
              }}
            >
              <Card style={contentCardStyle(false)}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Tag color="geekblue">{englishPreview.specialization}</Tag>
                  <div>
                    <Typography.Text type="secondary">
                      {t('knowledge.languages.english')}
                    </Typography.Text>
                    <Typography.Title level={3} style={{ marginTop: 8, marginBottom: 8 }}>
                      {englishPreview.title}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary">
                      {englishPreview.description}
                    </Typography.Paragraph>
                  </div>

                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(englishPreview.content || ''),
                    }}
                  />
                </Space>
              </Card>

              <Card style={contentCardStyle(true)}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Tag color="cyan">{arabicPreview.specialization}</Tag>
                  <div style={{ textAlign: 'right' }}>
                    <Typography.Text type="secondary">
                      {t('knowledge.languages.arabic')}
                    </Typography.Text>
                    <Typography.Title level={3} style={{ marginTop: 8, marginBottom: 8 }}>
                      {arabicPreview.title}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary">
                      {arabicPreview.description}
                    </Typography.Paragraph>
                  </div>

                  <div
                    style={{ textAlign: 'right' }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(arabicPreview.content || ''),
                    }}
                  />
                </Space>
              </Card>
            </div>

            <Card style={{ borderRadius: 24, borderColor: '#e7edf7' }}>
              <Typography.Title level={5}>
                {t('tickets.finalReport.attachments')}
              </Typography.Title>
              <KnowledgeAttachmentGallery
                attachments={report.attachments}
                emptyText={t('tickets.finalReport.noAttachments')}
                openLabel={t('tickets.tools.attachmentsOpen')}
              />
            </Card>
          </Space>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};

export default KnowledgeGeneratorDetailPage;
