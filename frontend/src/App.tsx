import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy } from 'react'
import SoftBackground from './components/ui/SoftBackground'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const RadarPage = lazy(() => import('./pages/RadarPage'))
const UseCasePage = lazy(() => import('./pages/UseCasePage'))

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={
                <div style={{
                    height: '100vh', width: '100vw',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-page)',
                }}>
                    <div className="animate-spin" style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: '3px solid var(--border-light)',
                        borderTopColor: 'var(--dxc-blue)',
                    }} />
                </div>
            }>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/methodology" element={<Navigate to="/how-it-works" replace />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/radar" element={<RadarPage />} />
                    <Route path="/usecase/:id" element={<UseCasePage />} />
                </Routes>
            </Suspense>
        </AnimatePresence>
    )
}

function App() {
    return (
        <BrowserRouter>
            <SoftBackground />
            <AnimatedRoutes />
        </BrowserRouter>
    )
}

export default App
