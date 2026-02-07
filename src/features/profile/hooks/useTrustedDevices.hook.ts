import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startRegistration } from "@simplewebauthn/browser";
import api from "../../../api/http";
import { endpoints } from "../../../api/profile/endpoints.api";

const base64urlToUint8Array = (base64url: string) => {
    if (typeof base64url !== "string") {
        throw new Error("base64urlToUint8Array: input must be a string");
    }
    console.log(base64url);
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    console.log(base64);
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLength);
    const rawData = atob(padded);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        buffer[i] = rawData.charCodeAt(i);
    }
    return buffer;
};


export const useTrustedDevices = (userId: string) => {
    const queryClient = useQueryClient();

    /* -------------------- LIST -------------------- */
    const devicesQuery = useQuery({
        queryKey: ["trusted-devices", userId],
        queryFn: async () => {
            const { data } = await api.get(endpoints.trustedDevices());
            return data;
        },
        enabled: !!userId,
    });

    /* -------------------- REMOVE -------------------- */
    const removeDevice = useMutation({
        mutationFn: (deviceId: string) =>
            api.delete(endpoints.removeTrustedDevices(deviceId)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["trusted-devices", userId],
            });
        },
    });

    /* -------------------- CREATE (WebAuthn) -------------------- */
    const addDevice = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.post(
                endpoints.trustedDevicesVerify(),
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["trusted-devices", userId],
            });
        },
    });

    const verifyDevice = useMutation({
        mutationFn: async () => {
            // 1️⃣ get options from backend
            const { data: options } = await api.post(
                endpoints.trustedDevicesOptions()
            );
            
            // Convert excludeCredentials
            if (options.excludeCredentials?.length) {
                options.excludeCredentials = options.excludeCredentials.map((c: any) => ({
                    ...c,
                    id: base64urlToUint8Array(c.id),
                }));
            }

            let credential: any = null;
            // 2️⃣ browser WebAuthn
            credential = await startRegistration(options)
            
            // ⛔ no backend write here
            return credential;
        },
    });



    return {
        devicesQuery,
        removeDevice,
        addDevice,
        verifyDevice,
    };
};

export default useTrustedDevices;