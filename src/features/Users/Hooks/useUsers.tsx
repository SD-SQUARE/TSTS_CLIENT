import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/http";
import type { Lookup, ProfileLookup, UserListItem } from "../Types/users";


// Generic fetch
export const useUsers = (role: string, page: number, pageSize: number) => {
    return useQuery({
        queryKey: ["users", role, page, pageSize],
        queryFn: async () => {
            const res = await api.get(`/v1/users/${role}/`, {
                params: { page_index: page, page_size: pageSize },
            });
            return {
                data: res.data.users as UserListItem[],
                total: Math.floor(res.data.meta_data?.total || 0)
            };
        },
    });
};

export const useDeleteUser = (role: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/v1/users/${role}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", role] }),
    });
};

export const useAddOrEditUser = (role: string, userId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) =>
            userId
                ? api.put(`/v1/users/${role}/${userId}`, data)
                : api.post(`/v1/users/${role}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", role] })
        ,
    });
};

export const useUniversities = () =>
    useQuery({
        queryKey: ["universities"],
        queryFn: async () =>
            (await api.get("/v1/lockups/universities/")).data.universities as Lookup[],
        staleTime: Infinity,
    });

export const useDomains = () =>
    useQuery({
        queryKey: ["domains"],
        queryFn: async () =>
            (await api.get("/v1/lockups/domains/")).data.domains as Lookup[],
        staleTime: Infinity,
    });

export const useDepartments = () =>
    useQuery({
        queryKey: ["departments"],
        queryFn: async () =>
            (await api.get("/v1/lockups/departments/")).data.departments as Lookup[],
        staleTime: Infinity,
    });

export const usePermissionProfiles = () =>
    useQuery({
        queryKey: ["permissionProfiles"],
        queryFn: async () => (await api.get("/v1/permissions/profile")).data.profiles as ProfileLookup[],
        staleTime: Infinity,
    });


export const useSpecializations = () =>
    useQuery({
        queryKey: ["specializations"],
        queryFn: async () => (await api.get("/v1/lockups/specializations/")).data.specializations as Lookup[],
        staleTime: Infinity,
    });
