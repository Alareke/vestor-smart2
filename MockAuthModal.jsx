/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function MockAuthModal({ isOpen, onClose, onConfirm, brokerName }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001]" onClick={onClose}>
            <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-xl w-full max-w-sm mx-4 text-white animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-b-[#2A3040]">
                    <h3 className="text-lg font-bold">Connect to {brokerName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-[#8A93A2] hover:text-white hover:bg-[#2A3040]">
                        <X size={20} />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-xs text-center bg-yellow-500/10 text-yellow-300 p-2 rounded-md">This is a simulation. Do not enter real credentials.</p>
                    <div>
                        <label className="text-sm text-[#8A93A2] mb-1 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#12161D] border border-[#2A3040] rounded-md p-2 text-sm input-inset focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="demo_user"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-[#8A93A2] mb-1 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#12161D] border border-[#2A3040] rounded-md p-2 text-sm input-inset focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="pt-4">
                        <button 
                            type="submit"
                            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#3E8BF3] hover:bg-[#1E66D6] rounded-md transition-colors"
                        >
                            Connect Account (Simulated)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}