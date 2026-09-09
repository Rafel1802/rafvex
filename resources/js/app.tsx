import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Rafvex';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Inertia React ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
                    <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                            !
                        </div>
                        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            {this.state.error?.message || 'An unexpected rendering error occurred.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                            >
                                Reload Page
                            </button>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => {
        if (!title) return appName;
        if (title.includes(appName)) return title;
        return `${title} - ${appName}`;
    },
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#dc2626',
        showSpinner: true,
    },
});
