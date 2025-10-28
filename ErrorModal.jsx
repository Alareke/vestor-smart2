/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { t } from './ui.ts';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]" aria-modal="true" role="dialog" data-dev-name="ErrorBoundary">
            <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 text-white">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-500/20 rounded-full flex-shrink-0 mt-1">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                         <h3 className="text-lg font-bold">{t('error_boundary_title')}</h3>
                         <p className="text-sm text-[#8A93A2] mt-2">{t('error_boundary_description')}</p>
                         <details className="mt-4 text-xs">
                             <summary className="cursor-pointer text-[#8A93A2] hover:text-white">{t('error_modal_details')}</summary>
                             <div className="mt-2 p-3 bg-[#12161D] rounded-md font-mono text-red-400 max-h-40 overflow-y-auto border border-red-500/20">
                                <p className="font-bold">Error:</p>
                                <code className="whitespace-pre-wrap break-all">{this.state.error?.toString()}</code>
                                <p className="font-bold mt-2">Stack Trace:</p>
                                <code className="whitespace-pre-wrap break-all">{this.state.errorInfo?.componentStack}</code>
                             </div>
                         </details>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#3E8BF3] hover:bg-[#1E66D6] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1A1F2A] transition-colors"
                     >
                        {t('common_refresh_page')}
                    </button>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}