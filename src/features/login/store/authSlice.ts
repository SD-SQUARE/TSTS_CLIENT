import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../interfaces/AuthState.interface";

const initialState: AuthState = {
    user: null,
    token: sessionStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<{ user: any; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;

            sessionStorage.setItem("token", action.payload.token);
        },
        logout(state) {
            state.user = null;
            state.token = null;
            sessionStorage.removeItem("token");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
