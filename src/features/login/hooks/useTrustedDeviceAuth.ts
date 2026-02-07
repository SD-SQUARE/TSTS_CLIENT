import { useMutation } from "@tanstack/react-query";
import { startAuthentication } from "@simplewebauthn/browser";
import { getAuthOptionsApi, verifyAuthApi } from "../../../api/auth/login/login.v2.api";

export const useTrustedDeviceAuth = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            // 1️⃣ Get options from server
            const options = await getAuthOptionsApi(userId);

        
            console.log("Ready options:", options);

            // 4️⃣ Browser WebAuthn
            const credential = await startAuthentication(options);

            console.log("Credential:", credential);

            // 5️⃣ Verify credential on server
            return await verifyAuthApi(credential);
        },
    });
};
