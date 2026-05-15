/**
 * Hook to detect if running inside the Electron desktop app
 * and access the RustDesk remote control API.
 */

declare global {
    interface Window {
        electronAPI?: {
            isElectron: boolean;
            rustdeskConnect: (remoteId: string) => Promise<{ success: boolean; error?: string }>;
            rustdeskGetId: () => Promise<{ success: boolean; id?: string; error?: string }>;
            rustdeskSetId: (newId: string) => Promise<{ success: boolean; error?: string }>;
            rustdeskIsInstalled: () => Promise<{ installed: boolean }>;
            rustdeskOpen: () => Promise<{ success: boolean }>;
        };
    }
}

export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
};

export const useElectron = () => {
    const electron = isElectron();
    const api = window.electronAPI;

    return {
        isElectron: electron,

        /** Connect to a remote machine by RustDesk ID */
        connectToRemote: async (remoteId: string) => {
            if (!electron || !api) return { success: false, error: 'Not running in Electron' };
            return api.rustdeskConnect(remoteId);
        },

        /** Get this machine's RustDesk ID */
        getLocalId: async () => {
            if (!electron || !api) return { success: false, error: 'Not running in Electron' };
            return api.rustdeskGetId();
        },

        /** Set this machine's RustDesk ID (requires admin elevation) */
        setLocalId: async (newId: string) => {
            if (!electron || !api) return { success: false, error: 'Not running in Electron' };
            return api.rustdeskSetId(newId);
        },

        /** Check if RustDesk is installed */
        isRustDeskInstalled: async () => {
            if (!electron || !api) return { installed: false };
            return api.rustdeskIsInstalled();
        },

        /** Open RustDesk standalone */
        openRustDesk: async () => {
            if (!electron || !api) return { success: false };
            return api.rustdeskOpen();
        },
    };
};
