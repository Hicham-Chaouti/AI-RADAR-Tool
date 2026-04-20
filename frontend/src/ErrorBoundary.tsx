import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null }

    static getDerivedStateFromError(error: Error) {
        return { error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info)
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 40, background: '#fee2e2', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h1 style={{ color: '#991b1b', fontSize: 20, marginBottom: 16 }}>Runtime Error</h1>
                    <pre style={{ color: '#991b1b', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                        {this.state.error.message}
                    </pre>
                    <pre style={{ color: '#666', whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 16 }}>
                        {this.state.error.stack}
                    </pre>
                </div>
            )
        }
        return this.props.children
    }
}
