import React from 'react';
import {
  Input,
  Button,
  Modal,
  Form,
  Card,
  Typography,
  Steps,
  Upload,
  Tag,
  Empty,
  Divider,
  Pagination,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  ReadOutlined,
  ShareAltOutlined,
  LinkOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import type { KnowledgeBaseItem } from '../types/knowledge-types';
import KnowledgeAttachmentGallery from './KnowledgeAttachmentGallery';

const { Title, Text } = Typography;

const TagOutlinedIcon = () => (
  <span role="img" aria-label="tag" className="anticon anticon-tag">
    <svg viewBox="64 64 896 896" focusable="false" data-icon="tag" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M938 458.8l-29.6-312.8c-1.5-16.2-14.4-29-30.6-30.6l-312.8-29.6c-2.6-.2-5.2.4-7.5 1.9L152.9 486.2c-15 15-15 39.3 0 54.3l296.2 296.2c7.5 7.5 17.3 11.2 27.1 11.2s19.7-3.8 27.2-11.2l398.6-398.6c1.5-2.3 2.1-4.9 1.9-7.5l-29.6-312.8zM572.5 784L208.1 419.6 525.7 102l368.7 34.9L929.3 505.6 572.5 784zM768 304c0-44.2-35.8-80-80-80s-80 35.8-80 80 35.8 80 80 80 80-35.8 80-80z"></path></svg>
  </span>
);

const KnowledgeBasePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';
  const activeLanguage = isRtl ? 'ar' : 'en';

  const auth = useSelector((state: any) => state.auth);
  const role = typeof auth?.user?.role === 'string' ? auth.user.role.toLowerCase() : '';
  const isPrivileged = role === 'admin' || role === 'technician' || role === 'superadmin';

  const {
    form,
    filteredData,
    total,
    isLoading,
    isModalOpen,
    currentStep,
    searchText,
    currentPage,
    pageSize,
    editingId,
    isSubmitting,
    viewingItem,
    openViewModal,
    closeViewModal,
    handleShareArticle,
    setSearchText,
    setCurrentPage,
    setPageSize,
    openModal,
    closeModal,
    handleWordImport,
    handleNextStep,
    handlePrevStep,
    handleFinish,
    handleDelete,
  } = useKnowledgeBase();

  const getLocalizedFieldMeta = (
    item: KnowledgeBaseItem,
    field: 'title' | 'description' | 'specialization' | 'content'
  ) => {
    const primaryLanguage = activeLanguage;
    const fallbackLanguage = activeLanguage === 'ar' ? 'en' : 'ar';
    const primary = item[`${field}_${primaryLanguage}` as keyof KnowledgeBaseItem];
    const fallback = item[`${field}_${fallbackLanguage}` as keyof KnowledgeBaseItem];
    const value = (primary || fallback || item[field] || '') as string;
    const language = primary ? primaryLanguage : fallback ? fallbackLanguage : activeLanguage;

    return {
      value,
      language,
      direction: language === 'ar' ? 'rtl' : 'ltr',
      textAlign: language === 'ar' ? 'right' : 'left',
    } as const;
  };

  const importBannerStyle: React.CSSProperties = {
    marginBottom: 16,
    padding: '12px 16px',
    background: '#f9f9f9',
    border: '1px dashed #d9d9d9',
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection:  'row',
  };

  const createLineClampStyle = (
    meta: ReturnType<typeof getLocalizedFieldMeta>,
    lines: number,
  ): React.CSSProperties => ({
    direction: meta.direction,
    textAlign: meta.textAlign,
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
  });

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };

  const stepsConfig = [
    {
      title: t('knowledge.steps.details'),
      fieldsToValidate: [
        'title_en',
        'specialization_en',
        'description_en',
        'title_ar',
        'specialization_ar',
        'description_ar',
      ],
      content: (
        <>
          <Divider titlePlacement={isRtl ? 'right' : 'left'} orientationMargin={0}>{t('knowledge.languages.english')}</Divider>
          <Form.Item name="title_en" label={t('knowledge.fields.title_en')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input size="large" placeholder={t('knowledge.fields.title_en_placeholder')} />
          </Form.Item>
          <Form.Item name="specialization_en" label={t('knowledge.fields.category_en')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input size="large" placeholder={t('knowledge.fields.category_en_placeholder')} prefix={<TagOutlinedIcon />} />
          </Form.Item>
          <Form.Item name="description_en" label={t('knowledge.fields.summary_en')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input.TextArea rows={3} placeholder={t('knowledge.fields.summary_en_placeholder')} showCount maxLength={200} />
          </Form.Item>

          <Divider titlePlacement={isRtl ? 'right' : 'left'} orientationMargin={0}>{t('knowledge.languages.arabic')}</Divider>
          <Form.Item name="title_ar" label={t('knowledge.fields.title_ar')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input size="large" placeholder={t('knowledge.fields.title_ar_placeholder')} style={{ direction: 'rtl', textAlign: 'right' }} />
          </Form.Item>
          <Form.Item name="specialization_ar" label={t('knowledge.fields.category_ar')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input size="large" placeholder={t('knowledge.fields.category_ar_placeholder')} prefix={<TagOutlinedIcon />} style={{ direction: 'rtl', textAlign: 'right' }} />
          </Form.Item>
          <Form.Item name="description_ar" label={t('knowledge.fields.summary_ar')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input.TextArea rows={3} placeholder={t('knowledge.fields.summary_ar_placeholder')} showCount maxLength={200} style={{ direction: 'rtl', textAlign: 'right' }} />
          </Form.Item>
        </>
      ),
    },
    {
      title: t('knowledge.steps.content'),
      fieldsToValidate: ['content_en', 'content_ar'],
      content: (
        <>
          <Divider titlePlacement={isRtl ? 'right' : 'left'} orientationMargin={0}>{t('knowledge.languages.english')}</Divider>
          <div style={importBannerStyle}>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <Text strong>{t('knowledge.fields.import_title')}</Text>
              <div style={{ fontSize: 12, color: '#888' }}>{t('knowledge.fields.import_desc')}</div>
            </div>
            <Upload accept=".docx" showUploadList={false} beforeUpload={handleWordImport('content_en')}>
              <Button icon={<UploadOutlined />} size="small">{t('knowledge.fields.import_btn')}</Button>
            </Upload>
          </div>
          <Form.Item name="content_en" label={t('knowledge.fields.content_en')} rules={[{ required: true, message: t('validation.required') }]} style={{ marginBottom: 40 }}>
            <ReactQuill
              theme="snow"
              modules={modules}
              style={{ height: 300, marginBottom: 50, direction: 'ltr' }}
              placeholder={t('knowledge.fields.content_en_placeholder')}
            />
          </Form.Item>

          <Divider titlePlacement={isRtl ? 'right' : 'left'} orientationMargin={0}>{t('knowledge.languages.arabic')}</Divider>
          <div style={importBannerStyle}>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <Text strong>{t('knowledge.fields.import_title')}</Text>
              <div style={{ fontSize: 12, color: '#888' }}>{t('knowledge.fields.import_desc')}</div>
            </div>
            <Upload accept=".docx" showUploadList={false} beforeUpload={handleWordImport('content_ar')}>
              <Button icon={<UploadOutlined />} size="small">{t('knowledge.fields.import_btn')}</Button>
            </Upload>
          </div>
          <Form.Item name="content_ar" label={t('knowledge.fields.content_ar')} rules={[{ required: true, message: t('validation.required') }]} style={{ marginBottom: 0 }}>
            <ReactQuill
              theme="snow"
              modules={modules}
              style={{ height: 300, marginBottom: 50, direction: 'rtl' }}
              placeholder={t('knowledge.fields.content_ar_placeholder')}
            />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', paddingBottom: 40, direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={{ background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)', padding: '40px 50px 80px', color: 'white', borderRadius: 12 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection:  'row' }}>
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>{t('knowledge.hub_title')}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>{t('knowledge.hub_subtitle')}</Text>
          </div>
          {isPrivileged && (
            <div style={{ display: 'flex', gap: 12, flexDirection:  'row' }}>
              <Button
                size="large"
                icon={<ReadOutlined />}
                onClick={() => navigate('/knowledge-base/generator')}
                style={{ borderRadius: 6, height: 45 }}
                className='primary-color'              
              >
                {t('knowledge.generator.open')}
              </Button>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: 6, height: 45 }}>
                {t('knowledge.create_btn')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '-30px auto 40px', padding: '0 24px' }}>
        <Input
          size="large"
          placeholder={t('knowledge.search_placeholder')}
          prefix={<SearchOutlined style={{ color: '#1890ff', fontSize: 20, [isRtl ? 'marginLeft' : 'marginRight']: 8 }} />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', height: 60, border: 'none' }}
        />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {isLoading ? (
          <Card loading style={{ borderRadius: 12 }} />
        ) : searchText && filteredData.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('knowledge.no_articles')} />
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
                alignItems: 'stretch',
              }}
            >
              {filteredData.map((item) => {
                const specializationMeta = getLocalizedFieldMeta(item, 'specialization');
                const titleMeta = getLocalizedFieldMeta(item, 'title');
                const descriptionMeta = getLocalizedFieldMeta(item, 'description');

                return (
                  <Card
                    key={item.id}
                    onClick={() => openViewModal(item)}
                    hoverable
                    bodyStyle={{ padding: 22, height: '100%' }}
                    style={{
                      borderRadius: 20,
                      border: '1px solid #dbe5f0',
                      boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                      height: '100%',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 18 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 12,
                          flexDirection:  'row',
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 16,
                            background: '#eef4ff',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <InfoCircleOutlined  style={{ fontSize: 24 }} />
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            justifyContent: isRtl ? 'flex-start' : 'flex-end',
                            flexDirection:  'row',
                          }}
                        >
                          <Tag
                            style={{
                              margin: 0,
                              borderRadius: 999,
                              padding: '5px 10px',
                              background: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #e2e8f0',
                              maxWidth: 170,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              direction: specializationMeta.direction,
                              textAlign: specializationMeta.textAlign,
                            }}
                          >
                            {specializationMeta.value}
                          </Tag>
                          <Button
                            type="text"
                            shape="circle"
                            icon={<ShareAltOutlined />}
                            aria-label={t('knowledge.share')}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleShareArticle(item);
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 999,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 21,
                            lineHeight: 1.5,
                            fontWeight: 700,
                            color: '#0f172a',
                            marginBottom: 8,
                            ...createLineClampStyle(titleMeta, 2),
                          }}
                        >
                          {titleMeta.value}
                        </div>

                        <Text
                          style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: 12,
                            marginBottom: 14,
                            textAlign: titleMeta.textAlign,
                          }}
                        >
                          {t('knowledge.card_label')}
                        </Text>

                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.9,
                            color: '#475569',
                            ...createLineClampStyle(descriptionMeta, 3),
                          }}
                        >
                          {descriptionMeta.value}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          marginTop: 'auto',
                          flexDirection:  'row',
                        }}
                      >
                        <Button
                          type="primary"
                          icon={isPrivileged ? <EyeOutlined /> : <ReadOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewModal(item);
                          }}
                          style={{
                            flex: 1,
                            height: 42,
                            borderRadius: 12,
                            background: '#0f4c81',
                            borderColor: '#0f4c81',
                            fontWeight: 600,
                          }}
                        >
                          {isPrivileged ? t('knowledge.view') : t('knowledge.read_article')}
                        </Button>

                        {isPrivileged && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(item);
                            }}
                            style={{ height: 42, borderRadius: 12, fontWeight: 600 }}
                          >
                            <EditOutlined /> {t('knowledge.edit')}
                          </Button>
                        )}

                        {isPrivileged && (
                          <Button
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            style={{ height: 42, borderRadius: 12, fontWeight: 600 }}
                          >
                            <DeleteOutlined />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                pageSizeOptions={['6', '9', '12', '18']}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size !== pageSize) {
                    setPageSize(size);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        title={null}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={820}
        centered
        destroyOnClose
        maskClosable={false}
        style={{ padding: 0 }}
      >
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', borderRadius: '8px 8px 0 0', textAlign: isRtl ? 'right' : 'left' }}>
          <Title level={4} style={{ margin: 0 }}>{editingId ? t('knowledge.modal_edit') : t('knowledge.modal_draft')}</Title>
          <Text type="secondary">{t('knowledge.modal_subtitle')}</Text>
        </div>

        <div style={{ padding: '24px 32px' }}>
          <Steps direction={isRtl ? ('rtl' as any) : ('ltr' as any)} current={currentStep} size="small" style={{ marginBottom: 32 }} items={stepsConfig.map((step) => ({ title: step.title }))} />

          <Form form={form} layout="vertical" preserve style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ minHeight: 320 }}>
              {stepsConfig.map((step, index) => (
                <div key={index} style={{ display: currentStep === index ? 'block' : 'none', animation: 'fadeIn 0.3s' }}>
                  {step.content}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f0f0', flexDirection:  'row' }}>
              <Button
                onClick={() => {
                  if (currentStep > 0) {
                    handlePrevStep();
                  } else {
                    form.resetFields();
                  }
                }}
              >
                {currentStep > 0 ? t('knowledge.actions.prev') : t('knowledge.actions.reset')}
              </Button>

              {currentStep < stepsConfig.length - 1 ? (
                <Button type="primary" onClick={() => handleNextStep(stepsConfig[currentStep].fieldsToValidate)}>
                  {t('knowledge.actions.next')}
                </Button>
              ) : (
                <Button type="primary" onClick={handleFinish} loading={isSubmitting}>
                  {editingId ? t('knowledge.actions.save') : t('knowledge.actions.publish')}
                </Button>
              )}
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        open={!!viewingItem}
        onCancel={closeViewModal}
        footer={null}
        width={960}
        centered
        destroyOnClose
        title={null}
        style={{ padding: 0, top: 20 }}
      >
        {viewingItem && (
          (() => {
            const specializationMeta = getLocalizedFieldMeta(viewingItem, 'specialization');
            const titleMeta = getLocalizedFieldMeta(viewingItem, 'title');
            const descriptionMeta = getLocalizedFieldMeta(viewingItem, 'description');
            const contentMeta = getLocalizedFieldMeta(viewingItem, 'content');

            return (
          <>
            <div style={{ padding: '32px 40px 28px', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderBottom: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', textAlign: titleMeta.textAlign }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexDirection:  'row' }}>
                <div style={{ flex: 1 }}>
                  <Tag color="blue" style={{ marginBottom: 14, borderRadius: 999, padding: '6px 12px', direction: specializationMeta.direction, textAlign: specializationMeta.textAlign }}>{specializationMeta.value}</Tag>
                  <Title level={2} style={{ margin: 0, direction: titleMeta.direction, textAlign: titleMeta.textAlign }}>{titleMeta.value}</Title>
                </div>
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => void handleShareArticle(viewingItem)}
                  style={{ borderRadius: 12, height: 42, paddingInline: 16, fontWeight: 700 }}
                >
                  {t('knowledge.share')}
                </Button>
              </div>
              <Text type="secondary" style={{ marginTop: 12, display: 'block', fontSize: 16, direction: descriptionMeta.direction, textAlign: descriptionMeta.textAlign }}>
                {descriptionMeta.value}
              </Text>
            </div>
            <div style={{ padding: '32px 40px', maxHeight: '70vh', overflowY: 'auto', textAlign: contentMeta.textAlign, background: '#ffffff' }}>
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: contentMeta.value || `<p>${t('knowledge.no_content')}</p>` }}
                style={{ fontSize: '16px', lineHeight: '1.9', color: '#334155', direction: contentMeta.direction, textAlign: contentMeta.textAlign, padding: 0 }}
              />
              {(viewingItem.attachments?.length ?? 0) > 0 && (
                <div style={{ marginTop: 28 }}>
                  <Divider>{t('tickets.finalReport.attachments')}</Divider>
                  <KnowledgeAttachmentGallery
                    attachments={viewingItem.attachments}
                    emptyText={t('tickets.finalReport.noAttachments')}
                    openLabel={t('tickets.tools.attachmentsOpen')}
                  />
                </div>
              )}
            </div>
            <div style={{ padding: '18px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '0 0 8px 8px', flexDirection:  'row' }}>
              <Text type="secondary">{t('knowledge.share_hint')}</Text>
              <Button size="large" onClick={closeViewModal}>{t('knowledge.actions.close')}</Button>
            </div>
          </>
            );
          })()
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;
