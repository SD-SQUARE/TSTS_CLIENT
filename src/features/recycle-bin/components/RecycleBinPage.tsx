import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { RollbackOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { recycleBinApi, type RecycleEntity } from "../services/recycleBinApi";

const RecycleBinPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState<string>();

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
    onSuccess: () => {
      invalidateRecords();
      queryClient.invalidateQueries({ queryKey: ["recycle-bin", "entities"] });
    },
  });

  const columns: ColumnsType<Record<string, unknown>> = useMemo(() => {
    const columnKeys = data?.columns ?? [];

    return [
      ...columnKeys.map((column) => ({
        title: t(`recycleBin.columns.${column}`, { defaultValue: column }),
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
        width: 90,
        render: (_, record) => (
          <Space>
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
    label: `${entity.label} (${entity.tableName})${entity.deletedCount ? ` - ${entity.deletedCount}` : ""}`,
  }));

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
    </div>
  );
};

export default RecycleBinPage;
