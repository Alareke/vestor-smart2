/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import '@tailwindcss/browser';

import ReactDOM from 'react-dom/client';
import Home from './Home';
import { LanguageProvider } from './i18n/LanguageContext';
import { DeveloperModeProvider } from './i18n/DeveloperModeContext';
import { ThemeProvider } from './i18n/ThemeContext';
import { TranslationDebugProvider } from './i18n/TranslationDebugContext';
import { AIProvider, QuotaErrorProvider } from './i18n/AIContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <TranslationDebugProvider>
            <DeveloperModeProvider>
                <LanguageProvider>
                    <AIProvider>
                        <QuotaErrorProvider>
                            <ThemeProvider>
                                <Home />
                            </ThemeProvider>
                        </QuotaErrorProvider>
                    </AIProvider>
                </LanguageProvider>
            </DeveloperModeProvider>
        </TranslationDebugProvider>
    </ErrorBoundary>
);