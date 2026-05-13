import axios from 'axios'
import i18n from '../i18n';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
})

let csrfToken: string | null = null;

export async function loadCsrfToken() {
    const res = await api.get("v1/auth/csrf-token");
    csrfToken = res.data.csrfToken;
}

// Attach token from session storage (simple approach)
api.interceptors.request.use((config) => {
    config.headers['Accept-Language'] = i18n.language || 'en'
    const token = sessionStorage.getItem('token')
    if (token && config.headers)
        config.headers.Authorization = `Bearer ${token}`

    if (csrfToken) {
        
        config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config
})


export default api
