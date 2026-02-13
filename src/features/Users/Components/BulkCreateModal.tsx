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
    const [sampleUrl, setSampleUrl] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            const fetchSample = async () => {
                try {
                    const response = await api.get(`http://127.0.0.1:3658/m1/1197709-1192710-default/users/${role}/bulk-sample`);
                    setSampleUrl(response.data.file || response.data);
                } catch (error) {
                    message.error(t("errors.sample_fetch_failed"));
                }
            };
            fetchSample();
        }
    }, [visible, role, t]);

    const handleUpload = async () => {
        if (fileList.length === 0) return;

        const formData = new FormData();
        fileList.forEach(file => {
            formData.append('files', file.originFileObj);
        });

        setIsSubmitting(true);
        try {
            await api.post(`http://127.0.0.1:3658/m1/1197709-1192710-default/users/${role}/bulk-sample`, formData);
            message.success(t("success.bulk_upload"));
            setFileList([]);
            onClose();
        } catch (error) {
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
            width={700}
            closable={false}
            keyboard={false}
            maskClosable={false}
            footer={[
                <Button key="cancel" onClick={onClose}>{t("common.cancel")}</Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    loading={isSubmitting} 
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                >
                    {t("common.submit")}
                </Button>
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
                            href={sampleUrl || '#'} 
                            target="_blank"
                            disabled={!sampleUrl}
                            download
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
                                <Space>
                                    <FileTextOutlined />
                                    {file.name}
                                    <Text type="secondary" >({(file.size / 1024).toFixed(2)} KB)</Text>
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