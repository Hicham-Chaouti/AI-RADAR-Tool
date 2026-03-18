/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dxc: {
                    blue: '#6198F3',
                    'blue-dark': '#334970',
                    orange: '#FF9259',
                    coral: '#E98166',
                    green: '#4ade80',
                    purple: '#9b8aff',
                },
                app: {
                    bg: '#080d1a',
                    surface: '#0d1425',
                    card: '#111827',
                    elevated: '#1a2235',
                    border: 'rgba(97,152,243,0.12)',
                    'border-bright': 'rgba(97,152,243,0.25)',
                    'text-primary': '#f0f4ff',
                    'text-secondary': '#a8b8d8',
                    'text-muted': '#5a6a88',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
