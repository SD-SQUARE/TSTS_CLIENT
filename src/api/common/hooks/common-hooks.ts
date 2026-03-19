import { message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

function extractArray<T>(result: any): T[] {
    if (!result) return [];
    if (Array.isArray(result)) return result;

    const likelyKeys = ['items', 'data', 'result', 'rows', 'universities', 'users', 'domains', 'departments','work_hours', 'specializations', 'profiles'];

    for (const key of likelyKeys) {
        if (Array.isArray(result[key])) return result[key];
    }

    for (const key of Object.keys(result)) {
        if (Array.isArray(result[key])) return result[key];
    }

    return [];
}

function extractTotal(result: any): number {
    if (!result) return 0;
    if (typeof result.total === 'number') return result.total;
    if (result.meta_data?.total !== undefined) return result.meta_data.total; 
    if (result.meta?.total !== undefined) return result.meta.total;
    if (result.pagination?.total !== undefined) return result.pagination.total;
    return 0;
}

interface UseGenericCrudProps<T, CreateDto, UpdateDto> {
    queryKey: QueryKey;
    fetchFn: () => Promise<any>;
    fetchOneFn?: (id: string | number) => Promise<T>;
    createFn: (data: CreateDto) => Promise<T>;
    updateFn: (params: { id: string | number; data: UpdateDto }) => Promise<T>;
    deleteFn: (id: string | number) => Promise<void>;
    onSuccess?: (operation: 'create' | 'update' | 'delete') => void;
    onError?: (error: any, operation: 'create' | 'update' | 'delete') => void;
}

export const useGenericCrud = <
    T extends { id: string | number },
    CreateDto,
    UpdateDto
>({
    queryKey,
    fetchFn,
    fetchOneFn,
    createFn,
    updateFn,
    deleteFn,
    onSuccess,
    onError,
}: UseGenericCrudProps<T, CreateDto, UpdateDto>) => {
    const queryClient = useQueryClient();

    const {
        data: rawData,
        isLoading,
        error: fetchError,
    } = useQuery({
        queryKey,
        queryFn: fetchFn,
    });

    const useGetOne = (id?: string | number) => {
        return useQuery({
            queryKey: [...queryKey, 'detail', id],
            queryFn: () => fetchOneFn!(id!),
            enabled: !!id && !!fetchOneFn, 
            staleTime: 5000, 
        });
    };

    const data = extractArray<T>(rawData);
    const total = extractTotal(rawData);

    const createMutation = useMutation({
        mutationFn: createFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            message.success('Item created successfully');
            onSuccess?.('create');
        },
        onError: (error) => {
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
        onError: (error) => {
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
        onError: (error) => {
            message.error('Failed to delete item');
            onError?.(error, 'delete');
        },
    });

    return {
        data,
        total, 
        isLoading,
        fetchError,
        useGetOne,
        createMutation,
        updateMutation,
        deleteMutation,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};