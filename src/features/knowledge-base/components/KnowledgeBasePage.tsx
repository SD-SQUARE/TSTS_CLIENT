import React from 'react';
import {
  Input, Button, Modal, Form, Card, List, Typography,
  Steps, Upload, Tag, Empty
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, UploadOutlined, FileWordOutlined,
  EyeOutlined, ReadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next'; 
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase'; 
import { useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;

const TagOutlinedIcon = () => (
    <span role="img" aria-label="tag" className="anticon anticon-tag">
       <svg viewBox="64 64 896 896" focusable="false" data-icon="tag" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M938 458.8l-29.6-312.8c-1.5-16.2-14.4-29-30.6-30.6l-312.8-29.6c-2.6-.2-5.2.4-7.5 1.9L152.9 486.2c-15 15-15 39.3 0 54.3l296.2 296.2c7.5 7.5 17.3 11.2 27.1 11.2s19.7-3.8 27.2-11.2l398.6-398.6c1.5-2.3 2.1-4.9 1.9-7.5l-29.6-312.8zM572.5 784L208.1 419.6 525.7 102l368.7 34.9L929.3 505.6 572.5 784zM768 304c0-44.2-35.8-80-80-80s-80 35.8-80 80 35.8 80 80 80 80-35.8 80-80z"></path></svg>
    </span>
);

const KnowledgeBasePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

    const auth = useSelector((state: any) => state.auth);
  const role: string = auth.user.role.toLowerCase();
  const isPrivileged = role === 'admin' || role === 'technician';

  const {
    form,
    filteredData,
    isLoading,
    isModalOpen,
    currentStep,
    searchText,
    editingId,
    isSubmitting,
    viewingItem,
    openViewModal,
    closeViewModal,
    setSearchText,
    openModal,
    closeModal,
    handleWordImport,
    handleNextStep,
    handlePrevStep,
    handleFinish,
    handleDelete
  } = useKnowledgeBase();

//   Quill Editor Option
  const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      ["link", "image"],
      ["clean"],
    ],
    
  },
};

  const stepsConfig = [
    {
      title: t('user_list.details'),
      fieldsToValidate: ['title', 'specialization', 'description'],
      content: (
        <>
          <Form.Item name="title" label={t('tickets.title')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input size="large" placeholder={t('tickets.titlePlaceholder')} />
          </Form.Item>
          <Form.Item name="specialization" label={t('translation.specializations')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input size="large" placeholder={t('group_form.select_specializations')} prefix={<TagOutlinedIcon />} />
          </Form.Item>
          <Form.Item name="description" label={t('tickets.description')} rules={[{ required: true, message: t('validation.required') }]}>
            <Input.TextArea rows={3} placeholder={t('tickets.descriptionPlaceholder')} showCount maxLength={200} />
          </Form.Item>
        </>
      ),
    },
    {
      title: t('tickets.description'),
      fieldsToValidate: ['content'],
      content: (
        <>
          <div style={{ 
            marginBottom: 16, padding: '12px 16px', background: '#f9f9f9', 
            border: '1px dashed #d9d9d9', borderRadius: 8, display: 'flex', 
            justifyContent: 'space-between', alignItems: 'center',
            flexDirection: isRtl ? 'row-reverse' : 'row' 
          }}>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <Text strong>{t('tickets.attachments')}</Text>
              <div style={{ fontSize: 12, color: '#888' }}>{isRtl ? 'ارفع ملف .docx للتعبئة التلقائية' : 'Upload a .docx file to auto-fill'}</div>
            </div>
            <Upload accept=".docx" showUploadList={false} beforeUpload={handleWordImport}>
              <Button icon={<UploadOutlined />} size="small">{t('tickets.upload')}</Button>
            </Upload>
          </div>
          <Form.Item name="content" rules={[{ required: true, message: t('validation.required') }]} style={{ marginBottom: 0 }}>
            <ReactQuill 
              theme="snow" 
              modules={modules} 
              style={{ height: 300, marginBottom: 50, direction: 'ltr' }} 
              placeholder={t('chat.placeholder')}  
            />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', paddingBottom: 40, direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)', padding: '40px 50px 80px', color: 'white', borderRadius: 12 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>{t('Knowledge-Base')}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>{t('home.hero_desc')}</Text>
          </div>
          {isPrivileged && (
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: 6, height: 45 }}>
              {isRtl ? 'إنشاء مقال' : 'Create Article'}
            </Button>
           )} 
        </div>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 800, margin: '-30px auto 40px', padding: '0 24px' }}>
        <Input 
          size="large" 
          placeholder={t('common.search')} 
          prefix={<SearchOutlined style={{ color: '#1890ff', fontSize: 20, [isRtl ? 'marginLeft' : 'marginRight']: 8 }} />} 
          allowClear  
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)} 
          style={{ borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', height: 60, border: 'none' }} 
        />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {isLoading ? <Card loading style={{ borderRadius: 12 }} /> : (searchText && searchText.length > 0 && filteredData && filteredData.length === 0) ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('translation.not_found')} /> : (
          <List
  grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
  dataSource={filteredData}
  renderItem={(item) => (
    <List.Item style={{ height: '100%' }}> 
        <Card
        onClick={() => openViewModal(item)}
        hoverable
        style={{ 
          borderRadius: 16, 
          border: '1px solid #f0f0f0', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
          height: '100%',       
          display: 'flex',      
          flexDirection: 'column',
            padding: 24, 
            flex: 1,   
        }}
        
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <div style={{ 
            width: 54, height: 54, 
            background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', 
            borderRadius: 14, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(24, 144, 255, 0.15)',
            flexShrink: 0 
          }}>
            <FileWordOutlined style={{ fontSize: 26, color: '#1890ff' }} />
          </div>
          <Tag color="blue" style={{ 
            margin: 0, 
            borderRadius: 100, 
            padding: '4px 12px', 
            border: 'none', 
            background: '#e6f7ff', 
            color: '#096dd9', 
            fontWeight: 600,
            fontSize: 12,
            height: 'fit-content'
          }}>
            {item.specialization}
          </Tag>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: isRtl ? 'right' : 'left' }}>
          <Title level={4} ellipsis={{ rows: 2 }} style={{ marginTop: 0, marginBottom: 12, fontSize: 18, fontWeight: 700, color: '#262626', minHeight: 54 }}>
            {item.title}
          </Title>
          <Paragraph 
            type="secondary" 
            ellipsis={{ rows: 3 }} 
            style={{ 
                fontSize: 14, 
                lineHeight: 1.6, 
                color: '#595959', 
                marginBottom: 0,
                height: 72,       
                overflow: 'hidden' 
            }}
          >
            {item.description}
          </Paragraph>
        </div>
    
        <div style={{ marginTop: 24, display: 'flex', gap: 8, alignItems: 'center', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          {isPrivileged ? (
            <>
              <Button 
                type="text" 
                style={{ flex: 1, height: 40, background: '#f0f5ff', borderRadius: 10, color: '#2f54eb', fontWeight: 600, fontSize: 13, border: '1px solid transparent', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#d6e4ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f5ff'; }}
                icon={<EyeOutlined />}
                onClick={() => openViewModal(item)}
              >
                {t('translation.view')}
              </Button>

              <Button 
                type="text" 
                style={{ flex: 1, background: '#fff7e6', borderRadius: 10, height: 40, color: '#fa8c16', fontWeight: 600, fontSize: 13, border: '1px solid transparent', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ffe7ba'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff7e6'; }}
                onClick={() => openModal(item)}
              >
                <EditOutlined /> {t('translation.edit')}
              </Button>

              <Button 
                type="text" 
                style={{ flex: 1, background: '#fff1f0', borderRadius: 10, height: 40, color: '#f5222d', fontWeight: 600, fontSize: 13, border: '1px solid transparent', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ffccc7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff1f0'; }}
                onClick={() => handleDelete(item.id)}
              >
                 <DeleteOutlined /> {t('translation.delete')}
              </Button>
            </>
          ) : (
            <Button 
              block 
              type="primary" 
              style={{ borderRadius: 12, height: 48, background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)', border: 'none', boxShadow: '0 6px 16px rgba(24, 144, 255, 0.25)', fontWeight: 600, fontSize: 15, letterSpacing: '0.5px' }}
              icon={<ReadOutlined />}
              onClick={() => openViewModal(item)}
            >
              {isRtl ? 'قراءة المقال' : 'Read Article'}
            </Button>
           )} 
        </div>
      </Card>
    </List.Item>
  )}
/>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal 
        title={null} 
        open={isModalOpen} 
        onCancel={closeModal} 
        footer={null} 
        width={720} 
        centered 
        destroyOnClose 
        maskClosable={false} 
        style={{ padding: 0 }}
      >
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', borderRadius: '8px 8px 0 0', textAlign: isRtl ? 'right' : 'left' }}>
          <Title level={4} style={{ margin: 0 }}>{editingId ? t('tickets.editTicket') : t('tickets.newTicket')}</Title>
          <Text type="secondary">{isRtl ? 'شارك المعرفة مع فريق العمل' : 'Share your knowledge with the team'}</Text>
        </div>
        
        <div style={{ padding: '24px 32px' }}>
          <Steps direction={isRtl ? 'rtl' as any : 'ltr' as any} current={currentStep} size="small" style={{ marginBottom: 32 }} items={stepsConfig.map(s => ({ title: s.title }))} />
          
          <Form form={form} layout="vertical" preserve={true} style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ minHeight: 320 }}>
              {stepsConfig.map((step, index) => (
                <div key={index} style={{ display: currentStep === index ? 'block' : 'none', animation: 'fadeIn 0.3s' }}>
                  {step.content}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f0f0', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <Button onClick={() => {
                if (currentStep > 0) {
                  handlePrevStep();
                } else {
                  form.resetFields(); 
                }
              }}>
                {currentStep > 0 ? t('group_form.previous') : t('common.reset')}
              </Button>
              
              {currentStep < stepsConfig.length - 1 ? (
                <Button type="primary" onClick={() => handleNextStep(stepsConfig[currentStep].fieldsToValidate)}>
                    {t('group_form.next')}
                </Button>
              ) : (
                <Button type="primary" onClick={handleFinish} loading={isSubmitting}>
                    {editingId ? t('common.save') : t('common.create')}
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
        width={800}
        centered
        destroyOnClose
        title={null}
        style={{ padding: 0 }}
      >
        {viewingItem && (
            <>
                <div style={{ padding: '32px 40px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', borderRadius: '8px 8px 0 0', textAlign: isRtl ? 'right' : 'left' }}>
                    <Tag color="blue" style={{ marginBottom: 12 }}>{viewingItem.specialization}</Tag>
                    <Title level={2} style={{ margin: 0 }}>{viewingItem.title}</Title>
                    <Text type="secondary" style={{ marginTop: 8, display: 'block', fontSize: 16 }}>
                        {viewingItem.description}
                    </Text>
                </div>
                <div style={{ padding: '32px 40px', maxHeight: '60vh', overflowY: 'auto', textAlign: isRtl ? 'right' : 'left' }}>
                    <div 
                        className="ql-editor" 
                        dangerouslySetInnerHTML={{ __html: viewingItem.content || '<p>No content available.</p>' }} 
                        style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}
                    />
                </div>
                <div style={{ padding: '16px 40px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', background: '#fff', borderRadius: '0 0 8px 8px' }}>
                    <Button size="large" onClick={closeViewModal}>{t('common.close')}</Button>
                </div>
            </>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;