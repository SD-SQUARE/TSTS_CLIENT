// features/trusted-devices/api/trustedDevices.api.ts
import api from "../../../api/http";

export const getTrustedDevices = (params: any) =>
    api.get("v1/trusted-devices/admin-view", { params });

export const deleteTrustedDevice = (id: string) =>
    api.delete(`v1/trusted-devices/admin-view/${id}`);
