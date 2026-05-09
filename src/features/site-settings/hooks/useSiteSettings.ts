import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi } from "../services/siteSettingsApi";

export const siteSettingsQueryKey = ["site-settings"] as const;
export const allowedEmailDomainsQueryKey = ["site-settings", "email-domains"] as const;

export const useSiteSettings = () =>
  useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: siteSettingsApi.getSettings,
    staleTime: 5 * 60 * 1000,
  });

export const useAllowedEmailDomains = () =>
  useQuery({
    queryKey: allowedEmailDomainsQueryKey,
    queryFn: siteSettingsApi.getAllowedEmailDomains,
    staleTime: 5 * 60 * 1000,
  });

export const useSiteSettingsMutations = () => {
  const queryClient = useQueryClient();

  const invalidateSettings = () =>
    queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey });
  const invalidateDomains = () =>
    queryClient.invalidateQueries({ queryKey: allowedEmailDomainsQueryKey });

  return {
    updateSettings: useMutation({
      mutationFn: siteSettingsApi.updateSettings,
      onSuccess: invalidateSettings,
    }),
    updateLogo: useMutation({
      mutationFn: siteSettingsApi.updateLogo,
      onSuccess: invalidateSettings,
    }),
    createDomain: useMutation({
      mutationFn: siteSettingsApi.createAllowedEmailDomain,
      onSuccess: invalidateDomains,
    }),
    updateDomain: useMutation({
      mutationFn: ({ id, domain }: { id: string; domain: string }) =>
        siteSettingsApi.updateAllowedEmailDomain(id, domain),
      onSuccess: invalidateDomains,
    }),
    deleteDomain: useMutation({
      mutationFn: siteSettingsApi.deleteAllowedEmailDomain,
      onSuccess: invalidateDomains,
    }),
  };
};
