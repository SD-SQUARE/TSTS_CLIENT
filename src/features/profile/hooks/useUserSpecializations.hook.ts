import { useQuery } from "@tanstack/react-query";
import api  from "../../../api/http";
import { endpoints } from "../../../api/profile/endpoints.api";

export const useUserSpecializations = (
    userId: string,
    page = 1,
    pageSize = 10
) => {
    return useQuery({
        queryKey: ["user-specializations", userId, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get(
                endpoints.userSpecializations(userId),
                { params: { page, pageSize } }
            );
            return data;
        },
        enabled: !!userId,
    });
};
