// In real app you will:
// import { startRegistration } from "@simplewebauthn/browser";

export const verifyDeviceWithWebAuthn = async () => {
    // MOCK
    await new Promise(res => setTimeout(res, 1200));

    return {
        verified: true,
        credential_id: "mock-credential-id",
    };
};
