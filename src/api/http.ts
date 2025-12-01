import axios from 'axios'
// import { API_HOST, API_PORT, API_PROTOCOL } from '../app/config'

// const URL = API_PROTOCOL + '://' + API_HOST + ':' + API_PORT + '/api'
const URL = 'http://127.0.0.1:3658/m1/1132766-1124795-default/'

const api = axios.create({
    baseURL: URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
})


// Attach token from session storage (simple approach)
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token')
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
    return config
})


export default api