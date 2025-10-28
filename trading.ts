/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from 'zustand';

declare global {
    interface Window {
        errorToast?: (message: string) => void;
    }
}

// --- Type Definitions ---
export type Position = {
    id: number;
    symbol: string;
    side: 'BUY' | 'SELL';
    qty: number;
    entryPrice: number;
    entryTime: string; // YYYY-MM-DD
};

export type Trade = Position & {
    closePrice: number;
    closeTime: string;
    pnl: number;
};

// --- Trading API Abstraction ---
// FIX: Export the TradingAPI interface so it can be imported by other modules.
export interface TradingAPI {
    openPosition(p: { symbol: string, side: 'BUY' | 'SELL', qty: number, price: number, time: string }): Promise<Position | null>;
    closePosition(id: number, closePrice: number, closeTime: string): Promise<boolean>;
    getPositions(): Promise<Position[]>;
    getHistory(): Promise<Trade[]>;
}

// --- API Implementations ---

// 1. Default Paper Trading Simulation
const SimulatedBrokerAPI: TradingAPI = {
    async openPosition(p) {
        console.log("SIMULATED_API: Opening position", p);
        return {
            id: Date.now(),
            symbol: p.symbol,
            side: p.side,
            qty: p.qty,
            entryPrice: p.price,
            entryTime: p.time,
        };
    },
    async closePosition(id, closePrice, closeTime) {
        console.log(`SIMULATED_API: Closing position ${id} at ${closePrice}`);
        return true;
    },
    async getPositions() { return []; },
    async getHistory() { return []; },
};

// 2. Simulated Brokerage Connection
const BrokerageSimAPI: TradingAPI = {
    async openPosition(p) {
        console.log("BROKERAGE_SIM_API: Sending order to broker...", p);
        await new Promise(res => setTimeout(res, 500));
        return {
            id: Date.now() + Math.random(),
            symbol: p.symbol,
            side: p.side,
            qty: p.qty,
            entryPrice: p.price,
            entryTime: p.time,
        };
    },
    async closePosition(id, closePrice, closeTime) {
        console.log(`BROKERAGE_SIM_API: Sending close order for ${id} at ${closePrice}`);
        await new Promise(res => setTimeout(res, 500));
        return true;
    },
    async getPositions() { return []; },
    async getHistory() { return []; },
};

// --- Zustand Store ---

type TradingState = {
    positions: Position[];
    orders: any[];
    history: Trade[];
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    activeBroker: string | null;
    api: TradingAPI;
};

type TradingStore = TradingState & {
    openPosition: (p: { symbol: string, side: 'BUY' | 'SELL', qty: number, price: number, time: string }) => Promise<void>;
    closePosition: (id: number, closePrice: number, closeTime: string) => Promise<void>;
    connectToBroker: (brokerId: string) => void;
    disconnect: () => void;
};

const persistMiddleware = (config) => (set, get, api) => {
    const state = config(
        (payload) => {
            set(payload);
            try {
                const { positions, history } = get();
                localStorage.setItem('vestor:tradingState', JSON.stringify({ positions, history }));
            } catch (e) {
                console.error("Failed to save trading state", e);
            }
        },
        get,
        api
    );

    let initial = {
        positions: [],
        history: [],
        orders: [],
        connectionStatus: 'disconnected',
        activeBroker: null,
        api: SimulatedBrokerAPI,
    };
    
    const stored = localStorage.getItem('vestor:tradingState');

    if (stored && stored !== 'null' && stored !== 'undefined') {
        try {
            const parsed = JSON.parse(stored);
            
            // Ensure parsed is a valid object with expected array properties
            if (parsed && typeof parsed === 'object') {
                const positions = Array.isArray(parsed.positions) ? parsed.positions : [];
                const history = Array.isArray(parsed.history) ? parsed.history : [];
                initial = { ...initial, positions, history };
            } else {
                // Parsed successfully but was not an object, treat as corrupted.
                throw new Error("Stored state is not a valid object.");
            }

        } catch (e) {
            console.error("Failed to load or parse trading state, resetting.", e);
            try {
                localStorage.removeItem('vestor:tradingState');
            } catch (removeError) {
                console.error("Also failed to remove corrupted state from localStorage.", removeError);
            }
        }
    }
    
    set(initial);
    return state;
};

export const useTradingStore = create<TradingStore>()(persistMiddleware((set, get) => ({
    positions: [],
    history: [],
    orders: [],
    connectionStatus: 'disconnected',
    activeBroker: null,
    api: SimulatedBrokerAPI,

    openPosition: async ({ symbol, side, qty, price, time }) => {
        const newPosition = await get().api.openPosition({ symbol, side, qty, price, time });
        if (newPosition) {
             set(state => ({
                positions: [...state.positions, newPosition],
            }));
        } else {
            window.errorToast?.(`Order for ${symbol} failed to execute.`);
        }
    },
    
    closePosition: async (id, closePrice, closeTime) => {
        const success = await get().api.closePosition(id, closePrice, closeTime);
        if (!success) {
            window.errorToast?.(`Failed to close position #${id} via API.`);
            return;
        }

        const position = get().positions.find(p => p.id === id);
        if (!position) return;

        const pnl = (closePrice - position.entryPrice) * position.qty * (position.side === 'BUY' ? 1 : -1);
        const trade: Trade = { ...position, closePrice, closeTime, pnl };
        
        set(state => ({
            positions: state.positions.filter(p => p.id !== id),
            history: [trade, ...state.history],
        }));
    },

    connectToBroker: (brokerId) => {
        set({ connectionStatus: 'connecting' });
        setTimeout(() => {
            set({
                connectionStatus: 'connected',
                activeBroker: brokerId,
                api: BrokerageSimAPI,
                positions: [],
                history: [],
            });
        }, 1000);
    },
    
    disconnect: () => {
        set({
            connectionStatus: 'disconnected',
            activeBroker: null,
            api: SimulatedBrokerAPI,
        });
        window.toast?.("Disconnected from brokerage.");
    },
})));