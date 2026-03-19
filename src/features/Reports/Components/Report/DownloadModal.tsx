import React from 'react';
import { Modal, Radio, Space } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    format: 'pdf' | 'excel';
    onFormatChange: (val: 'pdf' | 'excel') => void;
    isDownloading: boolean;
}

const DownloadModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, format, onFormatChange, isDownloading }) => {
    const { t } = useTranslation();

    return (
        <Modal
            title={t('report.choose_format')}
            open={isOpen}
            onOk={onConfirm}
            onCancel={onClose}
            okText={t('common.download')}
            confirmLoading={isDownloading}
        >
            <Radio.Group onChange={(e) => onFormatChange(e.target.value)} value={format}>
                <Space direction="vertical">
                    <Radio value="pdf">PDF Document (.pdf)</Radio>
                    <Radio value="excel">Excel Spreadsheet (.xlsx)</Radio>
                </Space>
            </Radio.Group>
        </Modal>
    );
};

export default DownloadModal;