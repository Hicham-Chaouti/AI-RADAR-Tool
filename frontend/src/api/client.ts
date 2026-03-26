import axios from 'axios'

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

export default client
