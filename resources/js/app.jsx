import './bootstrap';
import '../css/app.css';
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';

class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="p-6 max-w-2xl mx-auto font-sans text-slate-800">
                    <h1 className="text-xl font-semibold mb-2">Erreur au chargement</h1>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                        Rechargez la page. Écran blanc sans message&nbsp;: arrêtez Vite ou supprimez{' '}
                        <code className="bg-slate-100 px-1 rounded text-xs">public/hot</code>, puis{' '}
                        <code className="bg-slate-100 px-1 rounded text-xs">npm run build</code>
                        , et ouvrez l’URL Laravel (
                        <code className="bg-slate-100 px-1 rounded text-xs">http://127.0.0.1:8000</code>
                        ).
                    </p>
                    <pre className="text-sm bg-red-50 border border-red-200 rounded p-3 overflow-auto whitespace-pre-wrap">
                        {this.state.error?.message || String(this.state.error)}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(
        <AppErrorBoundary>
            <Root />
        </AppErrorBoundary>
    );
}
