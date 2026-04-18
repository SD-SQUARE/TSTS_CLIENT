import { useQuery } from "@tanstack/react-query";
import api from "../../../api/http";

export interface SystemInfoResponse {
    generatedAt: string;
    cpu: {
        usagePercent: number;
        cores: number;
        model: string;
        speedMhz: number;
        loadAverage: number[];
    };
    memory: {
        total: number;
        free: number;
        used: number;
        usagePercent: number;
        processRss: number;
        processHeapUsed: number;
        processHeapTotal: number;
    };
    disk: {
        path: string;
        total: number;
        free: number;
        used: number;
        usagePercent: number;
    } | null;
    runtime: {
        hostname: string;
        platform: string;
        arch: string;
        uptimeSeconds: number;
        processUptimeSeconds: number;
        nodeVersion: string;
        pid: number;
    };
}

export const useSystemInfo = () =>
    useQuery<SystemInfoResponse>({
        queryKey: ["system-info"],
        queryFn: async () => {
            const { data } = await api.get("/v1/users/system/info");
            return data;
        },
        refetchInterval: 30_000,
        staleTime: 15_000,
    });
