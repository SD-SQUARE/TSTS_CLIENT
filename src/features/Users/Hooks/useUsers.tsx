import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/http";
import type { Lookup, ProfileLookup, UserListItem } from "../Types/users";


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
            const res = await api.get(`/users/${role}/`, {
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
            const res = await api.get(`/users/${role}/${id}`);
            return res.data as UserListItem;
        },
        enabled: !!id, 
        staleTime: 5 * 60 * 1000, 
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

export const useDomains = (universityId?: string) =>
    useQuery({
        queryKey: ["domains", universityId],
        queryFn: async () => {
            if (!universityId) return [];
            const url = `/lockups/universities/${universityId}/domains`;
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
            const url = `/lockups/domains/${domainId}/departments`;
            const res = await api.get(url);
            return res.data.departments as Lookup[];
        },
        enabled: !!domainId,
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
