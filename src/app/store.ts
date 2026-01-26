import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/login/store/authSlice';
import { chatApi } from '../features/tickets/store/services/chatApi';
import { loadState, saveState } from './sessionStorage';

// Load persisted state from sessionStorage
const persistedState = loadState();

export const store = configureStore({
    reducer: {
        [chatApi.reducerPath]: chatApi.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // avoid RTK Query warnings
        }).concat(chatApi.middleware),
    preloadedState: persistedState, // restore persisted state
});

// Persist only auth slice
store.subscribe(() => {
    const state = store.getState();
    saveState({
        auth: state.auth,
    });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
