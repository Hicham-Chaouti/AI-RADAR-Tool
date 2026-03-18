import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy } from 'react'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const RadarPage = lazy(() => import('./pages/RadarPage'))
const UseCasePage = lazy(() => import('./pages/UseCasePage'))

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={
                <div className="h-screen w-screen bg-app-bg flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-dxc-blue border-t-transparent rounded-full" />
                </div>
            }>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
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
            <AnimatedRoutes />
        </BrowserRouter>
    )
}

export default App
