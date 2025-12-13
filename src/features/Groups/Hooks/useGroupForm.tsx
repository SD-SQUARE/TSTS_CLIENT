

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import type { GroupFormData } from '../Types/groups';
import api from '../../../api/http';
import i18n from '../../../i18n';




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

export interface Assignees {
  id: string;
  image: string;
  email: string;
  first_name_en: string;
  first_name_ar: string;
  mid_name_en: string;
  mid_name_ar: string;
  last_name_en: string;
  last_name_ar: string;
  user_type: string;
  status: string;
  job_en: string;
  job_ar: string;
}


interface AssigneesApiResponse {
  groups: Assignees[];
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserApiResponse {
  users: User[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatFullName = (user: any) => {
  const name = `${user.first_name} ${user.mid_name || ''} ${user.last_name}`.trim();
  // console.log(name);
  return name;
};
export const formatFullNameAssignee = (user: Assignees) => {
  return `${user[`first_name_${i18n.language}`]} ${user[`mid_name_${i18n.language}`] || ''} ${user[`last_name_${i18n.language}`]}`.trim();
};


export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await api.get('/lockups/admins');
      console.log(response.data);
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

      // Fetch both endpoints in parallel
      const [groupRes, usersRes] = await Promise.all([
        api.get<GroupFormData>(`/groups/${id}`),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.get<{ team_leader: any; heads: any[]; technicians: any[] }>(`/groups/${id}/users`),
      ]);

      const groupData = groupRes.data;
      const usersData = usersRes.data;

      // Merge them as needed
      return {
        team_leader: usersData.team_leader,
        heads: usersData.heads,
        ...groupData,
        members: usersData.technicians,
      };
    },
    enabled: !!id,
    staleTime: Infinity,
  });
};



export const useTechnicians = () => {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const response = await api.get('/lockups/technicians/');

      return response.data.users;
    },
    staleTime: Infinity,
  });
};
export const useAssignees = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['nonMembers', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const response = await api.get<AssigneesApiResponse>(`/lockups/groups/${groupId}/non-members-technicians`, { params: { page: 1, page_size: 100 } });

      return response.data.groups;
    },
    enabled: !!groupId,
    staleTime: Infinity,
  });
};


export const useGroupTechnicians = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['groupTechnicians', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const response = await api.get<AssigneesApiResponse>(
        `/lockups/groups/${groupId}/technicians`,
        { params: { page: 1, page_size: 100 } },
      );

      return response.data.groups;
    },
    enabled: !!groupId,
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

export const useAssignUsers = (groupId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => {
      if (!groupId) throw new Error("Group ID is missing for assignment.");
      console.log(userIds);
      return api.post(`/groups/${groupId}/assign`, { users: userIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
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