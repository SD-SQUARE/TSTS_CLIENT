import { useQuery } from "@tanstack/react-query";
import api  from "../../../api/http";
import { endpoints } from "../../../api/profile/endpoints.api";

export const useUserGroups = (
    userId: string,
    page = 1,
    pageSize = 10
) => {
    return useQuery({
        queryKey: ["user-groups", userId, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get(
                endpoints.userGroups(userId),
                { params: { page, pageSize } }
            );
            return data;
        },
        enabled: !!userId,
    });
};
