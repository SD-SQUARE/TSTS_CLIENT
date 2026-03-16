import DownloadModal from './Report/DownloadModal';
    const [downloadType, setDownloadType] = useState<'pdf' | 'excel'>('pdf');
    const [isDownloading, setIsDownloading] = useState(false);
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
                    onDownload={() => setIsModalOpen(true)}
