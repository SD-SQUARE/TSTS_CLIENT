import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/http";
import type { Lookup, ProfileLookup, UserListItem } from "../Types/users";


// Generic fetch
export const useUsers = (role: string, page: number, pageSize: number) => {
    return useQuery({
        queryKey: ["users", role, page, pageSize],
        queryFn: async () => {
            const res = await api.get(`/users/${role}/`, {
                params: { page, page_size: pageSize },
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
        mutationFn: (id: string) => api.delete(`/users/${role}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", role] }),
    });
};

export const useAddOrEditUser = (role: string, userId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) =>
            userId
                ? api.put(`/users/${role}/${userId}`, data)
                : api.post(`/users/${role}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", role] })
        ,
    });
};

export const useUniversities = () =>
    useQuery({
        queryKey: ["universities"],
        queryFn: async () =>
            (await api.get("/lockups/universities/")).data.universities as Lookup[],
        staleTime: Infinity,
    });

export const useDomains = () =>
    useQuery({
        queryKey: ["domains"],
        queryFn: async () =>
            (await api.get("/lockups/domains/")).data.domains as Lookup[],
        staleTime: Infinity,
    });

export const useDepartments = () =>
    useQuery({
        queryKey: ["departments"],
        queryFn: async () =>
            (await api.get("/lockups/departments/")).data.departments as Lookup[],
        staleTime: Infinity,
    });

export const usePermissionProfiles = () =>
    useQuery({
        queryKey: ["permissionProfiles"],
        queryFn: async () => (await api.get("/permissions/profile")).data.profiles as ProfileLookup[],
        staleTime: Infinity,
    });


export const useSpecializations = () =>
    useQuery({
        queryKey: ["specializations"],
        queryFn: async () => (await api.get("/lockups/specializations/")).data.specializations as Lookup[],
        staleTime: Infinity,
    });
