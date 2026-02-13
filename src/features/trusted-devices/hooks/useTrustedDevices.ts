// features/trusted-devices/hooks/useTrustedDevices.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getTrustedDevices,
    deleteTrustedDevice,
} from "../api/trustedDevices.api";

export const useTrustedDevices = (params: any) =>
    useQuery({
        queryKey: ["trusted-devices", params],
        queryFn: () => getTrustedDevices(params),
    });

export const useDeleteTrustedDevice = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteTrustedDevice,
        onSuccess: () => qc.invalidateQueries({
            queryKey: ["trusted-devices"],
        }),
    });
};
