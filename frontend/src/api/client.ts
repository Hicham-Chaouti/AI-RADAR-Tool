import axios from 'axios'
import i18n from '../i18n/config'

const getBaseURL = () => {
    // In Docker, use the backend service name on port 8000
    // In development or from browser, use localhost:8000
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${backendUrl}/api/v1`
}

const client = axios.create({
    baseURL: getBaseURL(),
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json',
    },
})

client.interceptors.request.use((config) => {
    const language = i18n.language?.startsWith('fr') ? 'fr' : 'en'
    config.headers['Accept-Language'] = language
    config.params = {
        ...(config.params || {}),
        lang: language,
    }
    return config
})

export default client
