import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Spin, Typography } from "antd";
import { customFormApi } from "../services/customFormApi";
import FormRenderer from "./FormRenderer";
import "./customForms.css";

const { Paragraph, Title } = Typography;

const FormPreviewPage = () => {
  const { id } = useParams<{ id: string }>();

  const formQuery = useQuery({
    queryKey: ["custom-form-preview", id],
    queryFn: () => customFormApi.getOne(id!),
    enabled: Boolean(id),
  });

  if (formQuery.isLoading) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!formQuery.data) {
    return (
      <Card>
        <Title level={4}>Form not found</Title>
        <Paragraph type="secondary">
          This form could not be loaded for preview.
        </Paragraph>
      </Card>
    );
  }

  return (
    <div className="custom-form-builder-page">
      <Alert
        type="info"
        showIcon
        message="Preview mode"
        description="This is the responder-facing layout. Submission is intentionally disabled here."
      />

      <FormRenderer
        title={formQuery.data.title}
        description={formQuery.data.description}
        fields={formQuery.data.fields || []}
        settings={formQuery.data.settings}
        previewOnly
      />
    </div>
  );
};

export default FormPreviewPage;
