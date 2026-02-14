/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Upload, List, Typography, Space, message, Flex, Divider } from 'antd';
import { DownloadOutlined, InboxOutlined, FileTextOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../../api/http';

const { Dragger } = Upload;
const { Text } = Typography;

interface BulkCreateModalProps {
    visible: boolean;
    onClose: () => void;
    role: string;
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({ visible, onClose, role }) => {
    const { t } = useTranslation();
    const [fileList, setFileList] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSample = async () => {
        try {
            const response = await api.get(`v1/users/${role}/bulk-sample`, {
                responseType: 'blob'
            });
            const blob = new Blob(
                [response.data],
                {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }
            );

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dispositionHeader = response.headers['content-disposition'];
            const fileNameMatch = dispositionHeader?.split('filename=');
            const fileName = fileNameMatch?.[1] || 'sample.xlsx';
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error(t("errors.sample_fetch_failed"));
        }
    };

    // useEffect(() => {
    //     if (visible) {
            
    //         fetchSample();
    //     }
    // }, [visible, role, t]);

    const handleUpload = async () => {
        if (fileList.length === 0) return;

        const formData = new FormData();
        fileList.forEach(file => {
            formData.append("file", file.originFileObj);
        });

        setIsSubmitting(true);

        try {
            // ✅ Success case (200 JSON)
            await api.post(
                `v1/users/${role}/bulk-sample`,
                formData,
                {
                    responseType: "blob", // IMPORTANT: works for both cases
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            message.success(t("success.bulk_upload"));
            setFileList([]);
            onClose();

        } catch (error: any) {
            const response = error?.response;

            // ❌ No response → real network/server error
            if (!response) {
                message.error(t("errors.upload_failed"));
                return;
            }

            // ❌ 400 → ZIP file
            if (response.status === 400) {
                const blob = new Blob([response.data], {
                    type: response.headers["content-type"] || "application/zip",
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");

                // 🔽 Extract filename safely
                const disposition = response.headers["content-disposition"];
                let filename = "bulk-errors.zip";

                if (disposition) {
                    const match = disposition.split("filename=");
                    if (match?.[1]) filename = match[1];
                }

                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                a.remove();
                window.URL.revokeObjectURL(url);

                message.error(t("errors.upload_failed"));
                return;
            }

            // ❌ Any other error
            message.error(t("errors.upload_failed"));
        } finally {
            setIsSubmitting(false);
        }
    };


    const removeFile = (uid: string) => {
        setFileList(prev => prev.filter(item => item.uid !== uid));
    };

    return (
        <Modal
            title={t("user_list.bulk_create")}
            open={visible}
            onCancel={onClose}
            width={900}
            closable={false}
            keyboard={false}
            maskClosable={false}
            footer={[
                <Flex justify="space-between" gap={8} style={{ width: '100%' }}>
                    <Button

                        style={{ width: "100%" }}
                        key="cancel"
                        onClick={onClose}>{t("common.cancel")}</Button>
                    <Button 

                        style={{ width: "100%" }}
                        key="submit" 
                        type="primary" 
                        loading={isSubmitting} 
                        onClick={handleUpload}
                        disabled={fileList.length === 0}
                    >
                        {t("common.submit")}
                    </Button>
                </Flex>
            ]}
        >
            <Flex vertical gap="large">
                <Card title={t("bulk.sample_title")} size="small">
                    <Flex justify="space-between" align="center">
                        <Space>
                            <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                            <Text>{t("bulk.sample_instruction")}</Text>
                        </Space>
                        <Button 
                            type="link" 
                            icon={<DownloadOutlined />}
                            onClick={fetchSample}
                        >
                            {t("bulk.download_sample")}
                        </Button>
                    </Flex>
                </Card>

                <Card title={t("bulk.upload_title")} size="small">
                    <Dragger
                        multiple
                        fileList={fileList}
                        beforeUpload={() => false} 
                        onChange={({ fileList }) => setFileList(fileList)}
                        showUploadList={false}
                    >
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">{t("bulk.drag_drop_text")}</p>
                    </Dragger>

                    <Divider  plain>{t("bulk.upload_preview")}</Divider>

                    <List
                        size="small"
                        dataSource={fileList}
                        renderItem={file => (
                            <List.Item
                                actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFile(file.uid)} />]}
                            >
                                <Space  >
                                    <FileTextOutlined />
                                    <Text >{file.name}</Text>
                                    <Text type="secondary" style={{margin: "0 2rem"}} >({(file.size / 1024).toFixed(2)} KB)</Text>
                                </Space>
                            </List.Item>
                        )}
                        locale={{ emptyText: t("bulk.no_files_selected") }}
                    />
                </Card>
            </Flex>
        </Modal>
    );
};

export default BulkCreateModal;