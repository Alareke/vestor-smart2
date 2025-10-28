import React, { useState } from 'react'
export default function ProvidersSwitcher(){
  const [prov,setProv]=useState(localStorage.getItem('provider')||'mock')
  const change = (p)=>{ setProv(p); localStorage.setItem('provider', p); window.dispatchEvent(new CustomEvent('provider:change',{detail:p})) }
  return (
    <div className="text-xs flex items-center gap-2">
      <span>مزود البيانات:</span>
      <select value={prov} onChange={(e)=>change(e.target.value)} className="bg-transparent border rounded px-2 py-1">
        <option value="mock">Mock</option>
        <option value="binance">Binance (proxy)</option>
        <option value="yahoo">Yahoo (proxy)</option>
        <option value="kraken">Kraken (proxy)</option>
      </select>
    </div>
  )
}