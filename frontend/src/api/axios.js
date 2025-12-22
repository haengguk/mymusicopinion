import axios from 'axios'

// 1. 환경변수에서 주소를 가져옴
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 2. 만약 주소 끝에 '/api'가 붙어있다면 제거 (프론트 코드에서 명시적으로 '/api/...'를 쓰기 위함)
// 예: https://site.com/api -> https://site.com
const baseURL = rawBaseUrl.endsWith('/api')
    ? rawBaseUrl.slice(0, -4)
    : rawBaseUrl;

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = token
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default api
