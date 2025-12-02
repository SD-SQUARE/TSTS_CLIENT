

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/http';
import type { Group } from '../Types/groups';


export const useGroups = (page: number, pageSize: number, searchQuery: {[key: string]: string} = {}) => {
  return useQuery({
    queryKey: ['groups', page, pageSize, searchQuery],
    queryFn: () => fetchGroups(page, pageSize, searchQuery),

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



export const fetchGroups = async (page: number, pageSize: number, searchQuery: {[key: string]: string}): Promise<{ data: Group[], total: number }> => {

  const query = Object.entries(searchQuery).filter(([,value]) => value).reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
  const response = await api.get<GroupApiResponse>(`/groups/`, {
    params: { page, page_size: pageSize, ...query },
  });

  console.log(response.data);


  return {
    data: response.data.groups,
    total: Math.floor(response.data.meta_data.total)

  };
};
