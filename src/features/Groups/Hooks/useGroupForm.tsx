import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/http';
import i18next from 'i18next';
import type {
  GroupAssignmentsPayload,
  GroupFormData,
  GroupUser,
  NamedObject,
} from '../Types/groups';

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

export interface Assignees extends GroupUser {}

interface GroupUsersResponse {
  team_leads: GroupUser[];
  heads: GroupUser[];
  technicians: GroupUser[];
  teams: GroupFormData['teams'];
  unassigned_members: GroupUser[];
}

export const formatFullName = (user: any) => {
  const firstName = user?.first_name || user?.first_name_en || user?.first_name?.en || '';
  const midName = user?.mid_name || user?.mid_name_en || user?.mid_name?.en || '';
  const lastName = user?.last_name || user?.last_name_en || user?.last_name?.en || '';
  return `${firstName} ${midName || ''} ${lastName}`.trim();
};

export const formatLocalizedUserName = (user: Partial<GroupUser>) => {
  const lang = i18next.language.startsWith('ar') ? 'ar' : 'en';
  const objectName = `${user.first_name?.[lang] || ''} ${user.mid_name?.[lang] || ''} ${user.last_name?.[lang] || ''}`.trim();
  const flatName = lang === 'ar'
    ? `${user.first_name_ar || ''} ${user.mid_name_ar || ''} ${user.last_name_ar || ''}`.trim()
    : `${user.first_name_en || ''} ${user.mid_name_en || ''} ${user.last_name_en || ''}`.trim();

  return (
    user.display_name ||
    (lang === 'ar' ? user.name_ar : user.name_en) ||
    objectName ||
    flatName ||
    user.name ||
    user.email ||
    ''
  );
};

export const toNamedObject = (user: Partial<GroupUser>): NamedObject => ({
  id: user.id || '',
  name: formatLocalizedUserName(user),
  name_en: user.name_en,
  name_ar: user.name_ar,
  user_type: user.user_type,
});

export const useAdmins = () =>
  useQuery({
    queryKey: ['admins', i18next.language],
    queryFn: async () => {
      const response = await api.get('v1/lockups/admins');
      return response.data.users;
    },
  });

export const useGroupHeadCandidates = () =>
  useQuery({
    queryKey: ['groupHeadCandidates', i18next.language],
    queryFn: async () => {
      const [adminsResponse, techniciansResponse] = await Promise.all([
        api.get('v1/lockups/admins'),
        api.get('v1/lockups/technicians/'),
      ]);

      const candidates = [
        ...(adminsResponse.data.users || []).map((user: GroupUser) => ({
          ...user,
          user_type: user.user_type || 'Admin',
        })),
        ...(techniciansResponse.data.users || []).map((user: GroupUser) => ({
          ...user,
          user_type: user.user_type || 'Technician',
        })),
      ];

      return Array.from(
        new Map(candidates.map((user: GroupUser) => [user.id, user])).values(),
      );
    },
  });

export const useGroupDetail = (id?: string) =>
  useQuery({
    queryKey: ['groupDetail', id],
    queryFn: async () => {
      if (!id) return null;

      const [groupRes, usersRes] = await Promise.all([
        api.get<GroupFormData>(`v1/groups/${id}`),
        api.get<GroupUsersResponse>(`v1/groups/${id}/users`),
      ]);

      const groupData = groupRes.data;
      const usersData = usersRes.data;

      return {
        ...groupData,
        heads:
          usersData.heads?.map((head) => toNamedObject(head)) ||
          groupData.heads ||
          [],
        team_leads:
          usersData.team_leads?.map((lead) => toNamedObject(lead)) ||
          groupData.team_leads ||
          [],
        members: usersData.technicians || [],
        teams: usersData.teams || groupData.teams || [],
        unassigned_members: usersData.unassigned_members || [],
      };
    },
    enabled: !!id,
  });

export const useTechnicians = () =>
  useQuery({
    queryKey: ['technicians', i18next.language],
    queryFn: async () => {
      const response = await api.get('v1/lockups/technicians/');
      return response.data.users;
    },
  });

export const useAssignees = (groupId: string | undefined) =>
  useQuery({
    queryKey: ['nonMembers', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const response = await api.get(`v1/lockups/groups/${groupId}/non-members-technicians`);
      return response.data.technicians;
    },
    enabled: !!groupId,
  });

export const useGroupTechnicians = (groupId: string | undefined) =>
  useQuery({
    queryKey: ['groupTechnicians', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const response = await api.get(`v1/lockups/groups/${groupId}/technicians`);
      return response.data.technicians;
    },
    enabled: !!groupId,
  });

export const useSpecializations = () =>
  useQuery({
    queryKey: ['specializations'],
    queryFn: async () => {
      const response = await api.get<GroupFormData>('v1/lockups/specializations/');
      return response.data.specializations;
    },
  });

export const useAssignUsers = (groupId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupAssignmentsPayload) => {
      if (!groupId) throw new Error('Group ID is missing for assignment.');
      return api.post(`v1/groups/${groupId}/assign`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groupTechnicians', groupId] });
      queryClient.invalidateQueries({ queryKey: ['nonMembers', groupId] });
    },
  });
};

export const useAddGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GroupFormData) => api.post('v1/groups/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useEditGroup = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      if (groupId === 'dummy-id-for-add-mode') {
        throw new Error('Attempted to edit a group without a valid ID.');
      }
      return api.put(`v1/groups/${groupId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
    },
  });
};
