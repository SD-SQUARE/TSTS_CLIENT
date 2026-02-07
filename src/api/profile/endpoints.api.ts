export const endpoints = {
    userProfile: (id: string) => `v1/users/profile/${id}/`,
    userGroups: (id: string) => `v1/users/profile/${id}/view/groups`,
    userSpecializations: (id: string) => `v1/users/profile/${id}/view/specializations`,
    trustedDevices: () => `v1/trusted-devices/`,
    removeTrustedDevices: (id: string) => `v1/trusted-devices/${id}/`,
    trustedDevicesOptions: () => `v1/trusted-devices/options/`,
    trustedDevicesVerify: () => `v1/trusted-devices/verify/`,
    resetPassword: (id: string) => `v1/users/profile/${id}/reset-password`,
};
