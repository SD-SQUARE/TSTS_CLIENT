import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../interfaces/AuthState.interface";
import api from "../../../api/http";

const initialState: AuthState = {
    user: null,
    token: sessionStorage.getItem("token") || null,
    initialized: false,
};


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.initialized = true;

            sessionStorage.setItem("token", action.payload.token);
            sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.initialized = true;

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            api.post("v1/auth/logout");
        },
        authInitialized(state) {
            state.initialized = true;
        },
    },
});

export const { loginSuccess, logout, authInitialized } = authSlice.actions;
export default authSlice.reducer;
