import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', color: 'var(--text-primary)', textAlign: 'center', background: 'var(--bg-dark)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h2>Oops, something went wrong.</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>We're working on getting this fixed right away.</p>
                    <button
                        style={{ marginTop: 24, padding: '10px 20px', background: 'var(--accent-gradient)', color: 'white', borderRadius: 8 }}
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
