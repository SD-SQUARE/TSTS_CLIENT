import { useMutation } from "@tanstack/react-query";
import { loginV2Api } from "../../../api/auth/login/login.v2.api";

export const useLoginV2 = () => {
    return useMutation({
        mutationFn: loginV2Api,
    });
};
