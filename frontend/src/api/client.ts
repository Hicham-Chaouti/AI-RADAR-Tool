import axios from 'axios'
import i18n from '../i18n/config'

const getBaseURL = () => {
    // Explicit override (e.g. VITE_API_URL=http://40.76.227.180:8000)
    if (import.meta.env.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}/api/v1`
    }
    // Relative path — goes through Vite proxy in dev, same-origin in production
    return '/api/v1'
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
