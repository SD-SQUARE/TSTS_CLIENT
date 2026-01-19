import { useState } from 'react';
import { Form, message, Modal } from 'antd';
import mammoth from 'mammoth';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { knowledgeBaseApi } from '../services/knowledgeBaseApi';
import type { KnowledgeBaseItem, CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from '../types/knowledge-types';

export const useKnowledgeBase = () => {
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
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
    queryKey: ['knowledgeBase'],
    fetchFn: () => knowledgeBaseApi.getAll(),
    createFn: (data) => knowledgeBaseApi.create(data),
    updateFn: ({ id, data }) => knowledgeBaseApi.update(id, data),
    deleteFn: (id) => knowledgeBaseApi.delete(id),
  });


  const handleWordImport = async (file: File) => {
    const hide = message.loading('Converting Word document...', 0);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        const currentContent = form.getFieldValue('content') || '';
        form.setFieldValue('content', currentContent + result.value);
        message.success('Word document imported successfully!');
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to parse Word document.');
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
        message.success("Article updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Article published successfully");
      }
      closeModal();
    } catch (e) { console.error(e); }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: 'Delete Article?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
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


  const filteredData = data?.filter(item =>
    (item.title?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
    (item.specialization?.toLowerCase() || "").includes(searchText.toLowerCase())
  ) || [];

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