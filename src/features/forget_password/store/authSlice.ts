import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {jwtDecode} from 'jwt-decode'


interface User { id?: string; email?: string }
interface AuthState { token: string | null; user: User | null }


const initialState: AuthState = {
    token: localStorage.getItem('token'),
    user: null,
}


const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string | null>) {
            state.token = action.payload
            if (action.payload) localStorage.setItem('token', action.payload)
            else localStorage.removeItem('token')


            try {
                state.user = action.payload ? (jwtDecode(action.payload) as User) : null
            } catch (e) {
                state.user = null
            }
        },
        logout(state) {
            state.token = null
            state.user = null
            localStorage.removeItem('token')
        },
    },
})


export const { setToken, logout } = slice.actions
export default slice.reducer