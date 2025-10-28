/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

const DeveloperModeContext = createContext(undefined);

export const DeveloperModeProvider = ({ children }: { children?: ReactNode }) => {
    const [isDevMode, setIsDevMode] = useState(false);

    const toggleDevMode = useCallback(() => {
        setIsDevMode(prev => !prev);
    }, []);

    const value = {
        isDevMode,
        toggleDevMode,
    };

    return (
        <DeveloperModeContext.Provider value={value}>
            {children}
        </DeveloperModeContext.Provider>
    );
};

export const useDeveloperMode = () => {
    const context = useContext(DeveloperModeContext);
    if (context === undefined) {
        throw new Error('useDeveloperMode must be used within a DeveloperModeProvider');
    }
    return context;
};