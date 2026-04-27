import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "../interfaces/AuthState.interface";
import api from "../../../api/http";

const initialState: AuthState = {
    user: null,
    token: sessionStorage.getItem("token") || null,
    initialized: false,
};

const clearAuthState = (state: AuthState) => {
    state.user = null;
    state.token = null;
    state.initialized = true;

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
};

export const logoutV2 = createAsyncThunk("auth/logoutV2", async () => {
    try {
        api.post("v2/auth/logout");
    } catch (error) {
        console.warn("Logout request failed", error);
    }
});

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
            clearAuthState(state);
            logoutV2();
        },
        authInitialized(state) {
            state.initialized = true;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logoutV2.fulfilled, (state) => {
            clearAuthState(state);
        });
    },
});

export const { loginSuccess, logout, authInitialized } = authSlice.actions;
export default authSlice.reducer;
