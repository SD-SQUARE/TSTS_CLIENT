/**
 * Hook to detect if running inside the Electron desktop app
 * and access the RustDesk remote control API.
 */

declare global {
    interface Window {
        electronAPI?: {
            isElectron: boolean;
            apiBaseUrl?: string;
            rustdeskConnect: (remoteId: string) => Promise<{ success: boolean; error?: string }>;
            rustdeskConnectViaProtocol: (remoteId: string) => Promise<{ success: boolean; error?: string }>;
            rustdeskGetId: () => Promise<{ success: boolean; id?: string; error?: string }>;
            rustdeskSetId: (newId: string) => Promise<{ success: boolean; error?: string }>;
            rustdeskIsInstalled: () => Promise<{ installed: boolean }>;
            rustdeskOpen: () => Promise<{ success: boolean; error?: string; warning?: string }>;
            rustdeskInstallService: () => Promise<{ success: boolean; error?: string }>;
            rustdeskConfigureServer: () => Promise<{ success: boolean; error?: string }>;
            desktopRegisterDevice: (payload: { email: string; rustdeskId?: string }) => Promise<{ success: boolean; rustdeskId?: string; error?: string }>;
        };
    }
}

export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
};

export const useElectron = () => {
    const electron = isElectron();
    const api = window.electronAPI;
    const cleanRemoteId = (remoteId: string) => remoteId?.toString().replace(/\s+/g, '');
    const buildRustDeskProtocolUrl = (remoteId: string) => {
        const base = (import.meta.env.VITE_RUSTDESK_PROTOCOL_BASE as string | undefined) || 'rustdesk://connection/new';
        return `${base.replace(/\/+$/, '')}/${encodeURIComponent(remoteId)}`;
    };

    return {
        isElectron: electron,

        /** Connect to a remote machine by RustDesk ID */
        connectToRemote: async (remoteId: string) => {
            if (!electron || !api) return { success: false, error: 'Not running in Electron' };
            return api.rustdeskConnect(remoteId);
        },

        /** Open the installed desktop protocol from a normal browser */
        connectViaProtocol: async (remoteId: string) => {
            if (electron && api?.rustdeskConnectViaProtocol) return api.rustdeskConnectViaProtocol(remoteId);
            const cleanId = cleanRemoteId(remoteId);
            if (!cleanId) return { success: false, error: 'No remote ID provided' };
            // Open in new tab so the current page isn't navigated away
            window.open(buildRustDeskProtocolUrl(cleanId), '_blank');
            return { success: true };
        },

        /** Open RustDesk directly from a normal browser when RustDesk has registered its URL scheme */
        openRustDeskProtocol: async (remoteId: string) => {
            const cleanId = cleanRemoteId(remoteId);
            if (!cleanId) return { success: false, error: 'No remote ID provided' };
            window.location.href = buildRustDeskProtocolUrl(cleanId);
            return { success: true };
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

        registerDesktopDevice: async (payload: { email: string; rustdeskId?: string }) => {
            if (!electron || !api?.desktopRegisterDevice) return { success: false, error: 'Not running in Electron' };
            return api.desktopRegisterDevice(payload);
        },

        /** Install RustDesk as a Windows service and configure self-hosted server */
        installRustDeskService: async () => {
            if (!electron || !api?.rustdeskInstallService) return { success: false, error: 'Not running in Electron' };
            return api.rustdeskInstallService();
        },

        /** Configure self-hosted RustDesk server on an already-installed instance */
        configureRustDeskServer: async () => {
            if (!electron || !api?.rustdeskConfigureServer) return { success: false, error: 'Not running in Electron' };
            return api.rustdeskConfigureServer();
        },
    };
};
