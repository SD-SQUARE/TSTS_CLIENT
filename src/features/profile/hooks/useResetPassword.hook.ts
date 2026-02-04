import { useMutation } from "@tanstack/react-query";
import  api  from "../../../api/http";
import { endpoints } from "../../../api/profile/endpoints.api";

export const useResetPassword = (userId: string) => {
    return useMutation({
        mutationFn: (payload: { password: string }) =>
            api.post(endpoints.resetPassword(userId), payload),
    });
};
