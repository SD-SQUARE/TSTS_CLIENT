/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Space, Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { useReportDetail } from '../Hooks/useReports';
import ReportFilterBar from './Report/ReportFilterBar';
import ReportChart from './Report/ReportChart';
import DownloadModal from './Report/DownloadModal';
import ReportTable from './Report/ReportTable';
import api from '../../../api/http';


const ReportViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const [dates, setDates] = useState<[string, string] | [undefined, undefined]>([undefined, undefined]);
    const [periodType, setPeriodType] = useState<string>('month');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadType, setDownloadType] = useState<'pdf' | 'excel'>('pdf');
    const [isDownloading, setIsDownloading] = useState(false);

    const [activeFilters, setActiveFilters] = useState<{ column: string; value: string }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtersQueryParam = useMemo(() => {
        return activeFilters.length > 0 ? JSON.stringify(activeFilters) : undefined;
    }, [activeFilters]);

    const { data, isLoading } = useReportDetail(id!, {
        startDate: dates[0],
        endDate: dates[1],
        periodType,
        filters: filtersQueryParam,
    }, currentPage, pageSize);
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get(`/v1/reports/${id}`, {
                params: {
                    download: true,
                    type: downloadType,
                    startDate: dates[0],
                    endDate: dates[1],
                    periodType: periodType,
                },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/zip",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const disposition = response.headers["content-disposition"];
            let filename = `Report_${id}.${downloadType === 'excel' ? 'xlsx' : 'pdf'}`;

            if (disposition) {
                const match = disposition.split("filename=");
                if (match?.[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            a.download = filename;

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            setIsModalOpen(false);
            message.success(t("success.download_complete"));

        } catch (error: any) {
            console.error("Download failed:", error);
            message.error(t("errors.download_error"));
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading && !data) return <Spin fullscreen size="large" />;

    return (
        <div style={{ padding: '24px' }}>
            <Typography.Title level={2}>{data?.title}</Typography.Title>


            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* Only show chart if there is statistics data */}
                {(isLoading || (data?.statistics && data.statistics.length > 0)) && (
                    <ReportChart
                        data={data?.statistics}
                        loading={isLoading}
                        title={t('dashboard.trends')}
                    />
                )}
                <ReportFilterBar
                    periodType={periodType}
                    dates={dates}
                    onDateChange={setDates}
                    onPeriodChange={setPeriodType}
                    onDownload={() => setIsModalOpen(true)}
                />
                <ReportTable
                    columns={data?.columns}
                    records={data?.records}
                    loading={isLoading}
                    title={t('report.details')}
                    filtersList={data?.filters || []}
                    activeFilters={activeFilters}
                    onFiltersChange={setActiveFilters}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: data?.meta?.total || 0,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                    }}
                />
            </Space>

            <DownloadModal
                isOpen={isModalOpen}
                format={downloadType}
                onClose={() => setIsModalOpen(false)}
                onFormatChange={setDownloadType}
                onConfirm={handleDownload}
                isDownloading={isDownloading}
            />
        </div>
    );
};

export default ReportViewPage;