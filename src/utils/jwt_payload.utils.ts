import { jwtDecode } from "jwt-decode";

export const getJWTPayload = token => jwtDecode(token)