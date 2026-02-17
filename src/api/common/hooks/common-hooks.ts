import { message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

function extractArray<T>(result: any): T[] {
    if (!result) return [];
    if (Array.isArray(result)) return result;

    // Try known keys
    const likelyKeys = ['items', 'data', 'result', 'rows', 'universities','users','domains','departments','specializations'];

    for (const key of likelyKeys) {
        if (Array.isArray(result[key])) return result[key];
    }

    // Fallback — find first array in object
    for (const key of Object.keys(result)) {
        if (Array.isArray(result[key])) return result[key];
    }

    return [];
}

interface UseGenericCrudProps<T, CreateDto, UpdateDto> {
    queryKey: QueryKey;
    fetchFn: () => Promise<any>;               // CHANGED
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
    createFn,
    updateFn,
    deleteFn,
    onSuccess,
    onError,
}: UseGenericCrudProps<T, CreateDto, UpdateDto>) => {
    const queryClient = useQueryClient();

    const {
        data = [],
        isLoading,
        error: fetchError,
    } = useQuery({
        queryKey,
        queryFn: fetchFn,
        select: (result) => extractArray<T>(result),
    });

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
        data: data ,
        isLoading,
        fetchError,
        createMutation,
        updateMutation,
        deleteMutation,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
