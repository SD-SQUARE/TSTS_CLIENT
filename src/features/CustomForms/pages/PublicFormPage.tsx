import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Result, Spin, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { customFormApi } from "../services/customFormApi";
import FormRenderer from "../components/FormRenderer";
import "../components/customForms.css";

const PublicFormPage = () => {
  const { token } = useParams<{ token: string }>();
  const [submitted, setSubmitted] = useState(false);

  const formQuery = useQuery({
    queryKey: ["public-form", token],
    queryFn: () => customFormApi.getByToken(token!),
    enabled: Boolean(token),
  });

  const submitMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      customFormApi.submitPublic(token!, values),
    onSuccess: () => setSubmitted(true),
    onError: () => {
      message.error("The form could not be submitted. Please try again.");
    },
  });

  if (formQuery.isLoading) {
    return (
      <div className="custom-form-public-page" style={{ textAlign: "center", paddingTop: 96 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!formQuery.data) {
    return (
      <Result
        status="404"
        title="Form unavailable"
        subTitle="The form link is invalid or has already expired."
        extra={
          <Button type="primary" href="/">
            Back home
          </Button>
        }
      />
    );
  }

  if (submitted) {
    return (
      <div className="custom-form-public-page">
        <Result
          status="success"
          title={formQuery.data.settings?.successTitle || "Response received"}
          subTitle={
            formQuery.data.settings?.successDescription ||
            "Thanks for filling out this form."
          }
          icon={<CheckCircleOutlined style={{ color: "#1f9d55" }} />}
        />
      </div>
    );
  }

  return (
    <div className="custom-form-public-page">
      <FormRenderer
        title={formQuery.data.title}
        description={formQuery.data.description}
        fields={formQuery.data.fields}
        settings={formQuery.data.settings}
        submitting={submitMutation.isPending}
        onSubmit={(values) => submitMutation.mutate(values)}
      />
    </div>
  );
};

export default PublicFormPage;
