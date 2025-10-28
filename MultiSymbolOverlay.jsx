import React, { useEffect } from 'react'
/** Overlay multiple symbols on main chart with normalization */
export default function MultiSymbolOverlay({ symbols=['BTCUSD','ETHUSD','AAPL'], base='BTCUSD' }){
  useEffect(()=>{
    window.dispatchEvent(new CustomEvent('overlay:multi', { detail: { symbols, base } }))
  },[JSON.stringify(symbols), base])
  return (
    <div className="text-xs opacity-70 p-2">
      Overlay: {symbols.join(', ')} (base: {base}) — تم تفعيل التطبيع النسبي.
    </div>
  )
}