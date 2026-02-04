import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api  from "../../../api/http";
import { endpoints } from "../../../api/profile/endpoints.api";

export const useTrustedDevices = (userId: string) => {
    const queryClient = useQueryClient();

    const devicesQuery = useQuery({
        queryKey: ["trusted-devices", userId],
        queryFn: async () => {
            const { data } = await api.get(endpoints.trustedDevices(userId));
            return data;
        },
        enabled: !!userId,
    });

    const removeDevice = useMutation({
        mutationFn: (deviceId: string) =>
            api.delete(`${endpoints.trustedDevices(userId)}/${deviceId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["trusted-devices", userId],
            });
        },
    });

    return { ...devicesQuery, removeDevice };
};
