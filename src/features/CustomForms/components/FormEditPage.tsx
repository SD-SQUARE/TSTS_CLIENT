import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Card, Typography, message } from "antd";
import { customFormApi } from "../services/customFormApi";
import type { CustomFormPayload } from "../types";
import FormBuilder from "./FormBuilder";
import { getErrorMessage } from "../../../utils/error";
import "./customForms.css";
import { useTranslation } from "react-i18next";

const { Paragraph, Title } = Typography;

const FormEditPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const isEditMode = Boolean(id);
  const ticketId = searchParams.get("ticketId");
  const returnTo = searchParams.get("returnTo");
  const isTicketMode = Boolean(ticketId);

  const formQuery = useQuery({
    queryKey: ["custom-form", id],
    queryFn: () => customFormApi.getOne(id!),
    enabled: isEditMode,
  });

  const goBack = () => {
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    navigate(-1);
  };

  const createMutation = useMutation({
    mutationFn: (payload: CustomFormPayload) =>
      customFormApi.create({
        ...payload,
        ticketId: ticketId || null,
        isGlobal: !ticketId,
      }),
    onSuccess: async () => {
      message.success(t('customForms.created', 'Form created.'));
      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      goBack();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, t('customForms.createError', 'Form could not be created.')));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CustomFormPayload) =>
      customFormApi.update(id!, {
        ...payload,
        ticketId: formQuery.data?.ticketId || ticketId || null,
        isGlobal: formQuery.data?.isGlobal ?? !ticketId,
      }),
    onSuccess: async () => {
      message.success(t('customForms.updated', 'Form updated.'));
      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      await queryClient.invalidateQueries({ queryKey: ["custom-form", id] });
      goBack();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, t('customForms.updateError', 'Form could not be updated.')));
    },
  });

  return (
    <div className="custom-form-builder-page">
      <Card className="custom-form-builder__panel">
        <Title level={2} style={{ marginBottom: 8 }}>
          {isEditMode ? t('customForms.editForm', 'Edit form') : t('customForms.createForm', 'Create form')}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {isTicketMode
            ? t('customForms.ticketModeDesc', 'This form will live inside the current ticket and can collect its own public responses.')
            : t('customForms.templateModeDesc', 'This form becomes a reusable template in your profile settings and can be attached to tickets later.')}
        </Paragraph>
      </Card>

      {returnTo ? (
        <Alert
          type="info"
          showIcon
          message={t('customForms.returnPathSaved', 'Return path saved')}
          description={t('customForms.returnPathDesc', 'When you save, you will be sent back to the page where you launched the builder.')}
        />
      ) : null}

      <Card
        className="custom-form-builder__panel"
        loading={isEditMode && formQuery.isLoading}
      >
        <FormBuilder
          initialValues={formQuery.data}
          mode={isTicketMode || formQuery.data?.ticketId ? "ticket" : "template"}
          loading={createMutation.isPending || updateMutation.isPending}
          onCancel={goBack}
          onSave={(payload) => {
            if (isEditMode) {
              updateMutation.mutate(payload);
              return;
            }

            createMutation.mutate(payload);
          }}
        />
      </Card>
    </div>
  );
};

export default FormEditPage;
