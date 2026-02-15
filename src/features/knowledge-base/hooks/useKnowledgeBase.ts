import { useEffect, useState } from 'react';
import { Form, message, Modal } from 'antd';
import mammoth from 'mammoth';
import { useTranslation } from 'react-i18next'; 
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { knowledgeBaseApi } from '../services/knowledgeBaseApi';
import type { KnowledgeBaseItem, CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from '../types/knowledge-types';

export const useKnowledgeBase = () => {
  const { t } = useTranslation(); 
  const [form] = Form.useForm();

    const [searchText, setSearchText] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeBaseItem | null>(null);

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<KnowledgeBaseItem, CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto>({
    queryKey: ['knowledgeBase', debouncedSearch],
    fetchFn: () => knowledgeBaseApi.getAll({search : debouncedSearch}),
    createFn: (data) => knowledgeBaseApi.create(data),
    updateFn: ({ id, data }) => knowledgeBaseApi.update(id, data),
    deleteFn: (id) => knowledgeBaseApi.delete(id),
  });


  const handleWordImport = async (file: File) => {
    const hide = message.loading(t('knowledge.fields.import_title'), 0); 
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        const currentContent = form.getFieldValue('content') || '';
        form.setFieldValue('content', currentContent + result.value);
        message.success(t('success.bulk_upload')); 
        } 
    } catch (error) {
      console.error(error);
      message.error(t('errors.uploadFailed')); 
    } finally {
      hide();
    }
    return false;
  };

  const openModal = (item?: KnowledgeBaseItem) => {
    setEditingId(item?.id || null);
    setCurrentStep(0);
    form.resetFields();
    if (item) form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleNextStep = async (fieldsToValidate: string[]) => {
    try {
      await form.validateFields(fieldsToValidate);
      setCurrentStep((prev) => prev + 1);
    } catch { 
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    else closeModal();
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: values });
        message.success(t('success.updated')); 
      } else {
        await createMutation.mutateAsync(values);
        message.success(t('success.created')); 
      }
      closeModal();
    } catch (e) { 
      console.error(e);
      message.error(t('errors.submitFailed')); 
    }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: t('translation.confirm_delete'), 
      content: t('knowledge.delete'), 
      okText: t('translation.yes'),
      cancelText: t('translation.no'),
      okType: 'danger',
      onOk: () => deleteMutation.mutate(id),
    });
  };
  const openViewModal = (item: KnowledgeBaseItem) => {
    setViewingItem(item);
  };
  const closeViewModal = () => {
    setViewingItem(null);
  };
  
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchText), 500); 
        return () => clearTimeout(timeout);
    }, [searchText]);

    const filteredData: any[] = data;
    

  return {
    form,
    filteredData,
    isLoading,
    isModalOpen,
    currentStep,
    searchText,
    editingId,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    

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
  };
};