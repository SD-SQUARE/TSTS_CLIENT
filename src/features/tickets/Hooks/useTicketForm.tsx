/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/http';


export const useSpecializations = () =>
  useQuery({
    queryKey: ['specializations'], queryFn: () =>
      api.get('v1/lockups/specializations/').then(res => res.data.specializations)
  });


export const useTechnicians = () =>
  useQuery({
    queryKey: ['technicians'], queryFn: () =>
          api.get('v1/lockups/technicians/').then(res => res.data.users)
  });

export const useAdmins = () =>
  useQuery({
    queryKey: ['admins'], queryFn: () =>
      api.get('v1/lockups/admins').then(res => res.data.users)
  });


export const useTicketDetails = (id?: string) =>
  useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/v1/tickets/${id}`).then(res => res.data),
    enabled: !!id,
  });


export const useTicketMutations = (id?: string) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/v1/tickets/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/v1/tickets/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  });

  const coordinateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/v1/tickets/${id}/co-ordinate`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  });

  return { createMutation, updateMutation, coordinateMutation };
};