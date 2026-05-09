import api from "../../http";

export const loginV2Api = async (data: { email: string; password: string }) => {
    const res = await api.post("v2/auth/login", data);
    return res.data; // { step, userId }
};

export const loginMicrosoftApi = async (idToken: string) => {
    const res = await api.post("v2/auth/microsoft", { idToken });
    return res.data;
};

export const getAuthOptionsApi = async (userId: string) => {
    const res = await api.post("v2/auth/trusted-device/options", { userId });
    return res.data;
};

export const verifyAuthApi = async (credential: any) => {
    const res = await api.post("v2/auth/trusted-device/verify", { credential });
    return res.data; // { access_token, permissions }
};
