

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/http';
import type { Group } from '../Types/groups';


export const useGroups = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['groups', page, pageSize],
    queryFn: () => fetchGroups(page, pageSize),

  });
};


export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/groups/${id}`),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['groups'] });


    },

  });
};


interface GroupApiResponse {
  groups: Group[];
  meta_data: {
    total: number;
    page_index: number;
    page_size: number;
  };
}



export const fetchGroups = async (page: number, pageSize: number): Promise<{ data: Group[], total: number }> => {

  const response = await api.get<GroupApiResponse>(`/groups/`, {
    params: { page, page_size: pageSize },
  });

  console.log(response.data);


  return {
    data: response.data.groups,
    total: Math.floor(response.data.meta_data.total)

  };
};
