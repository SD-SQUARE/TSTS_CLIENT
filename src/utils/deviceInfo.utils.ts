import {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
} from "react-device-detect";

export type TrustedDeviceType = "mobile" | "tablet" | "desktop";

export const getDeviceType = (): TrustedDeviceType => {
    if (isTablet) return "tablet";
    if (isMobile) return "mobile";
    return "desktop";
};

export const collectDeviceInfo = () => ({
    device_type: getDeviceType(),
    browser: `${browserName} ${browserVersion}`,
    os: `${osName} ${osVersion}`,
});
