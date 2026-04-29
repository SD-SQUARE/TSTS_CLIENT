import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { DownloadOutlined } from "@ant-design/icons";
import { customFormApi } from "../services/customFormApi";
import "./customForms.css";

const { Paragraph, Title } = Typography;

const ResponsesPage = () => {
  const { id } = useParams<{ id: string }>();

  const responsesQuery = useQuery({
    queryKey: ["custom-form-responses", id],
    queryFn: () => customFormApi.getResponses(id!),
    enabled: Boolean(id),
  });

  const columns = useMemo(() => {
    const payload = responsesQuery.data;
    if (!payload) return [];

    return payload.columns.map((column) => {
      if (column.key === "submittedAt") {
        return {
          title: column.title,
          dataIndex: "submittedAt",
          key: column.key,
          width: 220,
          render: (value: string) => dayjs(value).format("MMM D, YYYY h:mm A"),
        };
      }

      if (column.key === "responder" || column.key === "responderEmail") {
        return {
          title: column.title,
          dataIndex: column.key,
          key: column.key,
          ellipsis: true,
        };
      }

      return {
        title: column.title,
        key: column.key,
        ellipsis: true,
        render: (_: unknown, row: any) => {
          const value = row.answers?.[column.key];

          if (Array.isArray(value)) return value.join(", ");
          return value ?? "";
        },
      };
    });
  }, [responsesQuery.data]);

  const handleExport = async () => {
    if (!id) return;

    try {
      const response = await customFormApi.exportResponses(id);
      const blob = new Blob([response.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        responsesQuery.data?.form.title?.replace(/\s+/g, "_").toLowerCase() ||
        "form_responses"
      }_responses.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error("The export could not be generated right now.");
    }
  };

  if (!responsesQuery.data && responsesQuery.isLoading) {
    return <Card loading />;
  }

  const payload = responsesQuery.data;

  if (!payload) {
    return (
      <Card>
        <Empty description="Responses could not be loaded." />
      </Card>
    );
  }

  const lastResponse = payload.responses[0]?.submittedAt;

  return (
    <div className="custom-form-responses-page">
      <Card className="custom-form-builder__panel">
        <Space
          direction="vertical"
          size={6}
          style={{ width: "100%" }}
        >
          <Title level={2} style={{ marginBottom: 0 }}>
            {payload.form.title}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Dynamic response table built from the saved form schema. Export the
            same dataset from the backend as Excel in one click.
          </Paragraph>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            style={{ width: "fit-content" }}
          >
            Export Excel
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="custom-form-summary-card">
            <Statistic title="Responses" value={payload.meta.total} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="custom-form-summary-card">
            <Statistic title="Questions" value={payload.form.fields.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="custom-form-summary-card">
            <Statistic
              title="Latest response"
              value={
                lastResponse
                  ? dayjs(lastResponse).format("MMM D, YYYY h:mm A")
                  : "No responses yet"
              }
            />
          </Card>
        </Col>
      </Row>

      {payload.responses.length === 0 ? (
        <Card className="custom-form-item-card">
          <Empty description="No one has submitted this form yet." />
        </Card>
      ) : (
        <Card className="custom-form-item-card custom-form-responses-table">
          <Table
            rowKey="id"
            dataSource={payload.responses}
            columns={columns}
            scroll={{ x: 960 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
};

export default ResponsesPage;
