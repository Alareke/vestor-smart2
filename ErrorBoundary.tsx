/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

const FALLBACK_MESSAGES = {
    'error_boundary_title': 'Something went wrong.',
    'error_boundary_subtitle': 'An unexpected error occurred. Please try refreshing the page.',
    'error_boundary_details': 'Error Details',
};

// This component must be simple and must not use hooks that could be part of the error.
const ErrorDisplay = ({ error, errorInfo }: { error: Error | null, errorInfo: ErrorInfo | null }) => {
    const getMessage = (key: string) => FALLBACK_MESSAGES[key] || key;

    return (
        <div className="fixed inset-0 bg-red-900/90 z-[9999] flex items-center justify-center p-4 text-white font-sans">
            <div className="w-full max-w-2xl bg-red-800/50 border border-red-600 rounded-lg p-8 text-center shadow-2xl">
                <AlertTriangle size={48} className="mx-auto text-red-300 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">{getMessage('error_boundary_title')}</h1>
                <p className="text-red-200 mb-6">{getMessage('error_boundary_subtitle')}</p>
                <details className="mt-4 text-left bg-black/20 p-4 rounded">
                    <summary className="cursor-pointer text-red-300">{getMessage('error_boundary_details')}</summary>
                    <pre className="text-red-200 whitespace-pre-wrap font-mono text-xs mt-2">
                        {error && error.toString()}
                        <br />
                        {errorInfo && errorInfo.componentStack}
                    </pre>
                </details>
            </div>
        </div>
    );
};


interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    // FIX: The component was missing a constructor to initialize state and bind the `this` context.
    // This caused errors where `this.state`, `this.setState`, and `this.props` were not found on the component instance.
    // Adding the constructor and calling `super(props)` fixes this.
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return <ErrorDisplay error={this.state.error} errorInfo={this.state.errorInfo} />;
        }

        return this.props.children;
    }
}