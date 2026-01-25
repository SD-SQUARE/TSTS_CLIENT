import api  from "../../http";
import type { LoginDto } from "./login.dto";


export const loginApi = async (data: LoginDto) => {
    const response = await api.post("v1/auth/login", data);
    return response.data; // { accessToken, user }
};
