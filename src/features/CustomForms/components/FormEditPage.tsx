import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Card, Typography, message } from "antd";
import { customFormApi } from "../services/customFormApi";
import type { CustomFormPayload } from "../types";
import FormBuilder from "./FormBuilder";
import "./customForms.css";

const { Paragraph, Title } = Typography;

const FormEditPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

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
      message.success("Form created.");
      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      goBack();
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
      message.success("Form updated.");
      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      await queryClient.invalidateQueries({ queryKey: ["custom-form", id] });
      goBack();
    },
  });

  return (
    <div className="custom-form-builder-page">
      <Card className="custom-form-builder__panel">
        <Title level={2} style={{ marginBottom: 8 }}>
          {isEditMode ? "Edit form" : "Create form"}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {isTicketMode
            ? "This form will live inside the current ticket and can collect its own public responses."
            : "This form becomes a reusable template in your profile settings and can be attached to tickets later."}
        </Paragraph>
      </Card>

      {returnTo ? (
        <Alert
          type="info"
          showIcon
          message="Return path saved"
          description="When you save, you will be sent back to the page where you launched the builder."
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
