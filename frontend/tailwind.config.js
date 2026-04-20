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
                    blue: '#5a8de8',
                    'blue-vibrant': '#6198F3',
                    'blue-light': '#e8f0fe',
                    orange: '#F07A3A',
                    'orange-vibrant': '#FF9259',
                    coral: '#E07050',
                    green: '#16a34a',
                    purple: '#7c5cbf',
                },
                app: {
                    bg: '#fafbff',
                    surface: '#f3f5fb',
                    card: '#ffffff',
                    border: '#e5e7eb',
                    'text-primary': '#111827',
                    'text-secondary': '#6b7280',
                    'text-muted': '#9ca3af',
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'spin-slow': 'spin 3s linear infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
