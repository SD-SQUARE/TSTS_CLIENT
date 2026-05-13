import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Result, Spin, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { customFormApi } from "../services/customFormApi";
import FormRenderer from "../components/FormRenderer";
import { getErrorMessage } from "../../../utils/error";
import "../components/customForms.css";

const getLocalizedValue = (
  language: string,
  en?: string | null,
  ar?: string | null,
  fallback?: string | null,
) => (language.startsWith("ar") ? ar || en || fallback || "" : en || ar || fallback || "");

const PublicFormPage = () => {
  const { i18n } = useTranslation();
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
    onError: (error) => {
      message.error(getErrorMessage(error, "The form could not be submitted. Please try again."));
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
          title={
            getLocalizedValue(
              i18n.language,
              formQuery.data.settings?.successTitle_en,
              formQuery.data.settings?.successTitle_ar,
              formQuery.data.settings?.successTitle,
            ) || "Response received"
          }
          subTitle={
            getLocalizedValue(
              i18n.language,
              formQuery.data.settings?.successDescription_en,
              formQuery.data.settings?.successDescription_ar,
              formQuery.data.settings?.successDescription,
            ) || "Thanks for filling out this form."
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
        title_en={formQuery.data.title_en}
        title_ar={formQuery.data.title_ar}
        description={formQuery.data.description}
        description_en={formQuery.data.description_en}
        description_ar={formQuery.data.description_ar}
        fields={formQuery.data.fields}
        settings={formQuery.data.settings}
        submitting={submitMutation.isPending}
        onSubmit={(values) => submitMutation.mutate(values)}
      />
    </div>
  );
};

export default PublicFormPage;
