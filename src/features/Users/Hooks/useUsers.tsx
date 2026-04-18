import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/http";
import type { Lookup, PermissionLookup, ProfileLookup, UserListItem } from "../Types/users";


export const useUsers = (
    role: string, 
    page: number, 
    pageSize: number, 
    searchQuery: { [key: string]: string } = {}
) => {
        const activeSearch = Object.entries(searchQuery)
        .filter(([, value]) => value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return useQuery({
        queryKey: ["users", role, page, pageSize, activeSearch],
        
        queryFn: async () => {
            const res = await api.get(`v1/users/${role}/`, {
                params: { 
                    page_index: page, 
                    page_size: pageSize, 
                    ...activeSearch,
                },
            });
            
            return {
                data: res.data.users as UserListItem[],
                total: Math.floor(res.data.meta_data?.total || 0)
            };
        },
    });
};

export const useUserDetail = (role: string, id?: string) => {
    return useQuery({
        queryKey: ["userDetail", role, id],
        queryFn: async () => {
            if (!id) return null;
            const res = await api.get(`v1/users/${role}/${id}`);
            return res.data as UserListItem;
        },
        enabled: !!id, 
        staleTime: 5 * 60 * 1000, 
    });
};

export const useDeleteUser = (role: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`v1/users/${role}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", role] }),
    });
};

export const useAddOrEditUser = (role: string, userId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) =>
            userId
                ? api.put(`v1/users/${role}/${userId}`, data, { headers: { "Content-Type": "multipart/form-data" } })
                : api.post(`v1/users/${role}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", role] })
        ,
    });
};

export const useUniversities = () =>
    useQuery({
        queryKey: ["universities"],
        queryFn: async () =>
            (await api.get("v1/lockups/universities/")).data.universities as Lookup[],
        staleTime: Infinity,
    });

export const useDomains = (universityId?: string) =>
    useQuery({
        queryKey: ["domains", universityId],
        queryFn: async () => {
            if (!universityId) return [];
            const url = `v1/lockups/universities/${universityId}/domains`;
            const res = await api.get(url);
            return res.data.domains as Lookup[];
        },
        enabled: !!universityId,
        staleTime: Infinity,
    });

export const useDepartments = (domainId?: string) =>
    useQuery({
        queryKey: ["departments", domainId],
        queryFn: async () => {
            if (!domainId) return [];
            const url = `v1/lockups/domains/${domainId}/departments`;
            const res = await api.get(url);
            return res.data.departments as Lookup[];
        },
        enabled: !!domainId,
        staleTime: Infinity,
    });

export const usePermissionProfiles = () =>
    useQuery({
        queryKey: ["permissionProfiles"],
        queryFn: async () => (await api.get("v1/permissions/profile")).data.profiles as ProfileLookup[],
        staleTime: Infinity,
    });

export const useUserPermissionsProfile = (id?: string) =>
    useQuery({
        queryKey: ["userPermissionsProfile", id],
        queryFn: async () => {
            if (!id) return null;

            const res = await api.get(`v1/users/${id}/permissions`);
            const profile = (res.data?.[0] ?? null) as (ProfileLookup & {
                permissions?: PermissionLookup[];
            }) | null;

            return profile;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });


export const useSpecializations = () =>
    useQuery({
        queryKey: ["specializations"],
        queryFn: async () => (await api.get("v1/lockups/specializations/")).data.specializations as Lookup[],
        staleTime: Infinity,
    });
