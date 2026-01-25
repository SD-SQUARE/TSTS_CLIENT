import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../../api/auth/login/auth.api";
import { type LoginDto} from "../../../api/auth/login/login.dto";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import {getJWTPayload} from "../../../utils/jwt_payload.utils.ts"
export const useLogin = (SuccessHook:() => void) => {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn:  async (data: LoginDto) =>  await loginApi(data),
        onError: (error) => {
            console.error(error);
        },
        onSuccess: (data) => {
            dispatch(
                loginSuccess({
                    user: getJWTPayload(data.access_token),
                    token: data.access_token,
                })
            );
            SuccessHook();
        },
    });
};
