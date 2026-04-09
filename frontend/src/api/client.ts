import axios from 'axios'
import i18n from '../i18n/config'

const getBaseURL = () => {
    // Use VITE_API_URL if explicitly set, otherwise derive from current hostname
    // This makes the app work on any deployment (local, VM, cloud) without config changes
    const backendUrl =
        import.meta.env.VITE_API_URL ||
        `${window.location.protocol}//${window.location.hostname}:8000`
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
