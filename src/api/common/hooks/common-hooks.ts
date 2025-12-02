// import { useState, useCallback } from 'react';
import { message } from 'antd';
import {  useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {QueryKey} from '@tanstack/react-query';

interface UseGenericCrudProps<T, CreateDto, UpdateDto> {
  queryKey: QueryKey;
  fetchFn: () => Promise<T[]>;
  createFn: (data: CreateDto) => Promise<T>;
  updateFn: (params: { id: string | number; data: UpdateDto }) => Promise<T>;
  deleteFn: (id: string | number) => Promise<void>;
  onSuccess?: (operation: 'create' | 'update' | 'delete') => void;
  onError?: (error: any, operation: 'create' | 'update' | 'delete') => void;
}

export const useGenericCrud = <T extends { id: string | number }, CreateDto, UpdateDto>({
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  onSuccess,
  onError,
}: UseGenericCrudProps<T, CreateDto, UpdateDto>) => {
  const queryClient = useQueryClient();

  // Fetch all data
  const {
    data = [],
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      message.success('Item created successfully');
      onSuccess?.('create');
    },
    onError: (error: any) => {
      message.error('Failed to create item');
      onError?.(error, 'create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      message.success('Item updated successfully');
      onSuccess?.('update');
    },
    onError: (error: any) => {
      message.error('Failed to update item');
      onError?.(error, 'update');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      message.success('Item deleted successfully');
      onSuccess?.('delete');
    },
    onError: (error: any) => {
      message.error('Failed to delete item');
      onError?.(error, 'delete');
    },
  });

  // const refresh = useCallback(() => {
  //   refetch();
  // }, [refetch]);

  return {
    data,
    isLoading,
    fetchError,
    
    createMutation,
    updateMutation,
    deleteMutation,
    
    // refresh,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};