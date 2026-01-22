import axios from 'axios'
import { API_BASE_PATH, API_HOST, API_PORT, API_PROTOCOL } from '../app/config'
import i18n from '../i18n';

// const URL = API_PROTOCOL + '://' + API_HOST + ':' + API_PORT +'/'+ API_BASE_PATH;
const URL = "http://127.0.0.1:3658/m1/1128445-1120276-995927";

const api = axios.create({
    baseURL: URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
})


// Attach token from session storage (simple approach)
api.interceptors.request.use((config) => {
    config.headers['Accept-Language'] = i18n.language
    const token = sessionStorage.getItem('token')
    if (token && config.headers) 
        config.headers.Authorization = `Bearer ${token}`
    return config
})


export default api