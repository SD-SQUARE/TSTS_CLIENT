import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../../api/auth/login/auth.api";
import { type LoginDto} from "../../../api/auth/login/login.dto";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";

export const useLogin = () => {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: (data: LoginDto) => loginApi(data),

        onSuccess: (data) => {
            // data = { user, accessToken }
            dispatch(
                loginSuccess({
                    user: data.user,
                    token: data.accessToken,
                })
            );
        },
    });
};
