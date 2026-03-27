import React from 'react'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './ErrorBoundary'
import App from './App'
import { I18nProvider } from './i18n/I18nProvider'
import './i18n/config'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <I18nProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </I18nProvider>
    </React.StrictMode>,
)
