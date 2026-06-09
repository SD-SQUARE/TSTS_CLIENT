import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiIntegrationsApi, type ApiKeyPayload } from "../services/apiIntegrationsApi";

export const apiIntegrationsMetaQueryKey = ["api-integrations", "meta"] as const;
export const apiKeysQueryKey = ["api-integrations", "keys"] as const;

export const useApiIntegrationMeta = () =>
  useQuery({
    queryKey: apiIntegrationsMetaQueryKey,
    queryFn: apiIntegrationsApi.getMeta,
    staleTime: 10 * 60 * 1000,
  });

export const useApiKeys = () =>
  useQuery({
    queryKey: apiKeysQueryKey,
    queryFn: apiIntegrationsApi.getKeys,
  });

export const useApiKeyMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: apiKeysQueryKey });

  return {
    createKey: useMutation({
      mutationFn: apiIntegrationsApi.createKey,
      onSuccess: invalidate,
    }),
    updateKey: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<ApiKeyPayload> }) =>
        apiIntegrationsApi.updateKey(id, payload),
      onSuccess: invalidate,
    }),
    revokeKey: useMutation({
      mutationFn: apiIntegrationsApi.revokeKey,
      onSuccess: invalidate,
    }),
  };
};
