import { useQuery } from "@tanstack/react-query";
import api  from "../../../api/http";
import { endpoints } from "../../../api/profile/endpoints.api";
import i18next from "i18next";

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
            return {
                ...data,
                groups: data.groups.map((g: any) => ({
                    ...g,
                    name: i18next.language === "ar" ? g.name_ar : g.name_en,
                    description:
                        i18next.language === "ar"
                            ? g.description_ar
                            : g.description_en,
                })),
            };
        },
        enabled: !!userId,
    });
};
