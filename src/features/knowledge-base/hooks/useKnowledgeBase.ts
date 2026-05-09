import { useEffect, useState } from 'react';
import { Form, message, Modal } from 'antd';
import mammoth from 'mammoth';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { knowledgeBaseApi } from '../services/knowledgeBaseApi';
import type {
  CreateKnowledgeBaseDto,
  KnowledgeBaseFormValues,
  KnowledgeBaseItem,
  UpdateKnowledgeBaseDto,
} from '../types/knowledge-types';
import { getErrorMessage } from '../../../utils/error';

const mapItemToFormValues = (item: KnowledgeBaseItem): KnowledgeBaseFormValues => ({
  title_en: item.title_en ?? item.title ?? '',
  title_ar: item.title_ar ?? '',
  description_en: item.description_en ?? item.description ?? '',
  description_ar: item.description_ar ?? '',
  specialization_en: item.specialization_en ?? item.specialization ?? '',
  specialization_ar: item.specialization_ar ?? '',
  content_en: item.content_en ?? item.content ?? '',
  content_ar: item.content_ar ?? '',
});

const copyTextFallback = (value: string) => {
  if (typeof document === 'undefined') {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
};

export const useKnowledgeBase = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<KnowledgeBaseFormValues>();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeBaseItem | null>(null);
  const [requestedArticleId, setRequestedArticleId] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return new URLSearchParams(window.location.search).get('article');
  });

  const {
    data: categories = [],
  } = useQuery({
    queryKey: ['knowledgeBaseCategories'],
    queryFn: () => knowledgeBaseApi.getCategories(),
  });

  const {
    data,
    total,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<KnowledgeBaseItem, CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto>({
    queryKey: ['knowledgeBase', debouncedSearch, selectedCategory, currentPage, pageSize],
    fetchFn: () =>
      knowledgeBaseApi.getAll({
        search: debouncedSearch,
        category: selectedCategory,
        page: currentPage,
        page_size: pageSize,
      }),
    createFn: (payload) => knowledgeBaseApi.create(payload),
    updateFn: ({ id, data: payload }) => knowledgeBaseApi.update(id, payload),
    deleteFn: (id) => knowledgeBaseApi.delete(id),
  });

  const handleWordImport =
    (fieldName: 'content_en' | 'content_ar') =>
    async (file: File) => {
      const hide = message.loading(t('knowledge.messages.import_loading'), 0);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (result.value) {
          const currentContent = form.getFieldValue(fieldName) || '';
          form.setFieldValue(fieldName, currentContent + result.value);
          message.success(t('knowledge.messages.import_success'));
        }
      } catch (error) {
        console.error(error);
        message.error(t('knowledge.messages.import_error'));
      } finally {
        hide();
      }

      return false;
    };

  const openModal = (item?: KnowledgeBaseItem) => {
    setEditingId(item?.id || null);
    setCurrentStep(0);
    form.resetFields();

    if (item) {
      form.setFieldsValue(mapItemToFormValues(item));
    }

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
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      closeModal();
    }
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
    } catch (error) {
      console.error(error);
      message.error(getErrorMessage(error, t('errors.submitFailed')));
    }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: t('knowledge.messages.delete_title'),
      content: t('knowledge.messages.delete_confirm'),
      okText: t('translation.yes'),
      cancelText: t('translation.no'),
      okType: 'danger',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const openViewModal = (item: KnowledgeBaseItem) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('article', String(item.id));
      window.history.replaceState({}, '', url.toString());
    }

    setRequestedArticleId(String(item.id));
    setViewingItem(item);
  };

  const closeViewModal = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('article');
      window.history.replaceState({}, '', url.toString());
    }

    setRequestedArticleId(null);
    setViewingItem(null);
  };

  const handleShareArticle = async (item?: KnowledgeBaseItem) => {
    const targetItem = item ?? viewingItem;

    if (!targetItem || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('article', String(targetItem.id));

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
      } else {
        const copied = copyTextFallback(url.toString());
        if (!copied) {
          throw new Error('Clipboard API unavailable');
        }
      }
      message.success(t('knowledge.messages.share_success'));
    } catch (error) {
      console.error(error);
      message.error(t('knowledge.messages.share_error'));
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    if (!requestedArticleId || !data?.length) {
      return;
    }

    const matchedItem = data.find((item) => String(item.id) === requestedArticleId);
    if (matchedItem) {
      setViewingItem(matchedItem);
    }
  }, [data, requestedArticleId]);

  const filteredData: KnowledgeBaseItem[] = data ?? [];

  return {
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
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    viewingItem,
    categories,
    selectedCategory,
    openViewModal,
    closeViewModal,
    handleShareArticle,
    setSearchText,
    setSelectedCategory,
    setCurrentPage,
    setPageSize,
    openModal,
    closeModal,
    handleWordImport,
    handleNextStep,
    handlePrevStep,
    handleFinish,
    handleDelete,
  };
};
