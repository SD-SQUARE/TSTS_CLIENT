import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/login/store/authSlice'
import { chatApi } from '../features/tickets/store/services/chatApi'


export const store = configureStore({
    reducer: { 
        [chatApi.reducerPath]: chatApi.reducer,
        auth: authReducer },

        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(chatApi.middleware),
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch