import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/landing/HeroSection'
import SourcesBar from '../components/landing/SourcesBar'
import ProcessSteps from '../components/landing/ProcessSteps'
import FeaturesGrid from '../components/landing/FeaturesGrid'
import SectorGrid from '../components/landing/SectorGrid'
import CTABanner from '../components/landing/CTABanner'

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <Navbar />
      <HeroSection />
      <SourcesBar />
      <ProcessSteps />
      <FeaturesGrid />
      <SectorGrid />
      <CTABanner />
      <Footer />
    </motion.div>
  )
}
