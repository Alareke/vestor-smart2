/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTradingStore } from './trading.ts';
import MockAuthModal from './MockAuthModal.jsx';
import { CheckCircle, ZapOff, Power } from 'lucide-react';

const brokers = [
    { id: 'interactive_brokers', name: 'Interactive Brokers', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Interactive_Brokers_logo.svg' },
    { id: 'alpaca', name: 'Alpaca', logo: 'https://alpaca.markets/images/assets/logo.svg' },
    { id: 'tradestation', name: 'TradeStation', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/TradeStation_Logo.svg' },
    { id: 'binance', name: 'Binance', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.svg' },
];

const BrokerCard = ({ broker, onConnect, isConnected, isActive }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${isActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#2A3040] bg-[#1A1F2A]'}`}>
        <div className="flex items-center gap-3">
            <img src={broker.logo} alt={broker.name} className="h-8 w-8 object-contain bg-white/10 rounded-full p-1" />
            <span className="font-semibold text-white">{broker.name}</span>
        </div>
        {isConnected && isActive ? (
            <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <CheckCircle size={16} />
                <span>Connected</span>
            </div>
        ) : (
            <button
                onClick={() => onConnect(broker.id)}
                className="px-3 py-1 text-xs font-semibold text-white bg-[#3E8BF3] hover:bg-[#1E66D6] rounded-md transition-colors"
            >
                Connect
            </button>
        )}
    </div>
);

export default function BrokeragePanel() {
    const { connectionStatus, activeBroker, connectToBroker, disconnect } = useTradingStore();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState(null);

    const handleConnect = (brokerId) => {
        setSelectedBroker(brokerId);
        setIsAuthModalOpen(true);
    };

    const handleAuthSuccess = () => {
        connectToBroker(selectedBroker);
        setIsAuthModalOpen(false);
        window.toast?.(`Successfully connected to ${selectedBroker} (simulated).`);
    };
    
    const isConnected = connectionStatus === 'connected';

    return (
        <div className="h-full flex flex-col text-white p-4">
            <MockAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onConfirm={handleAuthSuccess}
                brokerName={brokers.find(b => b.id === selectedBroker)?.name || ''}
            />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Brokerage Connection</h3>
                {isConnected && (
                    <button 
                        onClick={disconnect}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
                    >
                        <Power size={14} />
                        Disconnect
                    </button>
                )}
            </div>
            
            <div className={`p-3 rounded-lg mb-4 flex items-center gap-3 ${isConnected ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                {isConnected ? <CheckCircle size={20} className="text-green-400" /> : <ZapOff size={20} className="text-yellow-400" />}
                <div>
                    <p className="font-semibold text-sm">{isConnected ? `Connected via ${activeBroker}` : 'Disconnected'}</p>
                    <p className="text-xs text-gray-400">{isConnected ? 'Live trading simulated via brokerage API.' : 'Trades are running in paper trading simulation.'}</p>
                </div>
            </div>

            <p className="text-sm text-[#8A93A2] mb-3">Connect to a broker to enable live trading from the chart.</p>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
                 {brokers.map(broker => (
                    <BrokerCard 
                        key={broker.id}
                        broker={broker}
                        onConnect={handleConnect}
                        isConnected={isConnected}
                        isActive={isConnected && activeBroker === broker.id}
                    />
                 ))}
            </div>
        </div>
    );
}