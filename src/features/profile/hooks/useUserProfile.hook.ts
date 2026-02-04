import { useQuery } from "@tanstack/react-query";
import api from "../../../api/http";
import {endpoints}  from "../../../api/profile/endpoints.api";
import type { User } from "../interfaces/user.interface";

export const useUserProfile = (userId: string) => {
    return useQuery<User>({
        queryKey: ["user-profile", userId],
        queryFn: async () => {
            const { data } = await api.get(endpoints.userProfile(userId));
            return data;
        },
        enabled: !!userId,
    });
};
