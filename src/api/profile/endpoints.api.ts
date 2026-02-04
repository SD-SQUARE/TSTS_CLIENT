export const endpoints = {
    userProfile: (id: string) => `v1/users/profile/${id}/`,
    userGroups: (id: string) => `v1/users/profile/${id}/view/groups`,
    userSpecializations: (id: string) => `v1/users/profile/${id}/view/specializations`,
    trustedDevices: (id: string) => `v1/users/profile/${id}/trusted-devices`,
    resetPassword: (id: string) => `v1/users/profile/${id}/reset-password`,
};
