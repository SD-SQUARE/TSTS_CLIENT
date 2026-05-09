import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, RollbackOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { recycleBinApi, type RecycleEntity } from "../services/recycleBinApi";
import { getErrorMessage } from "../../../utils/error";

const RecycleBinPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState<string>();
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [editJson, setEditJson] = useState("");

  const { data: entities = [], isLoading: entitiesLoading } = useQuery({
    queryKey: ["recycle-bin", "entities"],
    queryFn: recycleBinApi.getEntities,
  });

  const { data, isLoading: recordsLoading } = useQuery({
    queryKey: ["recycle-bin", selectedEntity],
    queryFn: () => recycleBinApi.getDeletedRecords(selectedEntity!),
    enabled: !!selectedEntity,
  });

  const invalidateRecords = () =>
    queryClient.invalidateQueries({ queryKey: ["recycle-bin", selectedEntity] });

  const restoreMutation = useMutation({
    mutationFn: ({ entity, id }: { entity: string; id: string }) =>
      recycleBinApi.restore(entity, id),
    onSuccess: invalidateRecords,
  });

  const updateMutation = useMutation({
    mutationFn: ({ entity, id, payload }: { entity: string; id: string; payload: Record<string, unknown> }) =>
      recycleBinApi.update(entity, id, payload),
    onSuccess: invalidateRecords,
  });

  const columns: ColumnsType<Record<string, unknown>> = useMemo(() => {
    const visibleColumns = (data?.columns ?? []).filter((column) =>
      ["id", "deletedAt", "createdAt", "updatedAt", "name", "email", "title", "status"].includes(column),
    );
    const fallbackColumns = (data?.columns ?? []).slice(0, 6);
    const columnKeys = visibleColumns.length ? visibleColumns : fallbackColumns;

    return [
      ...columnKeys.map((column) => ({
        title: column,
        dataIndex: column,
        key: column,
        ellipsis: true,
        render: (value: unknown) => {
          if (value && typeof value === "object") {
            return <Typography.Text>{JSON.stringify(value)}</Typography.Text>;
          }
          return <Typography.Text>{String(value ?? "-")}</Typography.Text>;
        },
      })),
      {
        title: t("user_list.operations"),
        key: "actions",
        fixed: "right" as const,
        width: 150,
        render: (_, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecord(record);
                setEditJson(JSON.stringify(record, null, 2));
              }}
            />
            <Popconfirm
              title={t("recycleBin.restoreConfirm")}
              okText={t("translation.yes")}
              cancelText={t("translation.no")}
              onConfirm={() =>
                restoreMutation.mutate({
                  entity: selectedEntity!,
                  id: String(record.id),
                })
              }
            >
              <Button icon={<RollbackOutlined />} loading={restoreMutation.isPending} />
            </Popconfirm>
          </Space>
        ),
      },
    ];
  }, [data?.columns, restoreMutation.isPending, selectedEntity, t]);

  const entityOptions = entities.map((entity: RecycleEntity) => ({
    value: entity.key,
    label: `${entity.label} (${entity.tableName})`,
  }));

  const handleSaveEdit = async () => {
    if (!selectedEntity || !editingRecord) return;

    try {
      const parsed = JSON.parse(editJson) as Record<string, unknown>;
      await updateMutation.mutateAsync({
        entity: selectedEntity,
        id: String(editingRecord.id),
        payload: parsed,
      });
      setEditingRecord(null);
      setEditJson("");
      message.success(t("success.updated"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>{t("recycleBin.title")}</Typography.Title>

      <Card>
        <Flex vertical gap={16}>
          <Select
            loading={entitiesLoading}
            options={entityOptions}
            value={selectedEntity}
            onChange={setSelectedEntity}
            placeholder={t("recycleBin.selectEntity")}
            style={{ maxWidth: 420 }}
            showSearch
          />

          <Table
            rowKey={(record) => String(record.id)}
            columns={columns}
            dataSource={data?.records ?? []}
            loading={recordsLoading}
            scroll={{ x: "max-content" }}
          />
        </Flex>
      </Card>

      <Modal
        title={t("recycleBin.editDeletedRecord")}
        open={!!editingRecord}
        onCancel={() => {
          setEditingRecord(null);
          setEditJson("");
        }}
        onOk={handleSaveEdit}
        okText={t("common.save")}
        confirmLoading={updateMutation.isPending}
        width={720}
      >
        <Input.TextArea
          value={editJson}
          onChange={(event) => setEditJson(event.target.value)}
          rows={16}
          style={{ fontFamily: "monospace" }}
        />
      </Modal>
    </div>
  );
};

export default RecycleBinPage;
