

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import type { GroupFormData } from '../Types/groups';
import api from '../../../api/http';




export interface User {
  id: string;
  image: string;
  email: string;
  first_name: string;
  mid_name: string;
  last_name: string;
  user_type: string;
  status: string;
}

interface UserApiResponse {
  users: User[];
}

export const formatFullName = (user: User) => {
  return `${user.first_name} ${user.mid_name || ''} ${user.last_name}`.trim();
};


export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await api.get<UserApiResponse>('/lockups/admins');

      return response.data.users;
    },
    staleTime: Infinity,
  });
};

export const useGroupDetail = (id?: string) => {
  return useQuery({
    queryKey: ['groupDetail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<GroupFormData>(`/groups/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: Infinity,
  })
}


export const useTechnicians = () => {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const response = await api.get<UserApiResponse>('/lockups/technicians/');

      return response.data.users;
    },
    staleTime: Infinity,
  });
};



export const useSpecializations = () => {
  return useQuery({
    queryKey: ['specializations'],
    queryFn: async () => {

      const response = await api.get<GroupFormData>('/lockups/specializations/');



      return response.data.specializations;
    },

    staleTime: Infinity,
  });
};



export const useAddGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GroupFormData) => api.post('/groups/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};


export const useEditGroup = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GroupFormData) => {

      if (groupId === 'dummy-id-for-add-mode') {
        throw new Error("Attempted to edit a group without a valid ID.");
      }
      return api.put(`/groups/${groupId}`, data);
    }, onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};