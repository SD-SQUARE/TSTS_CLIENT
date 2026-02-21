import axios from 'axios'
import { API_BASE_PATH, API_HOST, API_PORT, API_PROTOCOL } from '../app/config'
import i18n from '../i18n';

const URL = API_PROTOCOL + '://' + API_HOST + ':' + API_PORT + '/' + API_BASE_PATH;

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
    config.headers['Accept-Language'] = i18n.language
    const token = sessionStorage.getItem('token')
    if (token && config.headers)
        config.headers.Authorization = `Bearer ${token}`

    if (csrfToken) {
        
        config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config
})


export default api