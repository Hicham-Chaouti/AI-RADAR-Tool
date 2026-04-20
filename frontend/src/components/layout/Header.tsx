// TODO (Phase 6): Implement Header with DXC branding
import { Link } from 'react-router-dom'

/** Application header with DXC logo and navigation. */
export default function Header() {
    return (
        <header className="bg-dxc-blue-dark text-white px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-wide">
                AI Radar <span className="text-dxc-orange">DXC</span>
            </Link>
            <nav className="flex gap-4 text-sm">
                <Link to="/" className="hover:text-dxc-orange transition-colors">New Session</Link>
                <Link to="/results" className="hover:text-dxc-orange transition-colors">Results</Link>
            </nav>
        </header>
    )
}
