const { contextBridge, ipcRenderer } = require("electron");

const apiBaseUrl =
    process.env.TSTS_API_URL ||
    `http://${process.env.TSTS_API_HOST || "192.168.56.1"}:${process.env.TSTS_API_PORT || "5050"}/api`;

contextBridge.exposeInMainWorld("electronAPI", {
    apiBaseUrl,
    isElectron: true,
    rustdeskConnect: (remoteId) => ipcRenderer.invoke("rustdesk:connect", remoteId),
    rustdeskConnectViaProtocol: (remoteId) => ipcRenderer.invoke("rustdesk:connect-protocol", remoteId),
    rustdeskGetId: () => ipcRenderer.invoke("rustdesk:get-id"),
    rustdeskSetId: (newId) => ipcRenderer.invoke("rustdesk:set-id", newId),
    rustdeskIsInstalled: () => ipcRenderer.invoke("rustdesk:is-installed"),
    rustdeskServerStatus: () => ipcRenderer.invoke("rustdesk:server-status"),
    rustdeskOpen: () => ipcRenderer.invoke("rustdesk:open"),
    rustdeskInstallService: () => ipcRenderer.invoke("rustdesk:install-service"),
    rustdeskConfigureServer: () => ipcRenderer.invoke("rustdesk:configure-server"),
    desktopRegisterDevice: (payload) => ipcRenderer.invoke("desktop:register-device", payload),
});
