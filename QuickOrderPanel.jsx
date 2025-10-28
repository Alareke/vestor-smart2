import React, { useState } from 'react'
export default function QuickOrderPanel(){
  const [sym,setSym]=useState(()=>window.stockSymbol||'BTCUSD')
  const [qty,setQty]=useState(1)
  const mkt = (side)=> window.dispatchEvent(new CustomEvent('trade:submit',{detail:{symbol:sym, side, qty}}))
  const limit = (side)=>{
    if (!px) return
    window.dispatchEvent(new CustomEvent('order:limit',{detail:{symbol:sym, side, qty, price:Number(px)}}))
  }
  return (
    <div className="flex gap-2 items-center text-xs">
      <input value={sym} onChange={e=>setSym(e.target.value.toUpperCase())} className="bg-transparent border rounded px-2 py-1 w-24"/>
      <input value={qty} onChange={e=>setQty(Number(e.target.value||1))} className="bg-transparent border rounded px-2 py-1 w-16" type="number" />
      <button onClick={()=>mkt('BUY')} className="rounded border px-3 py-1 hover:bg-white/5">Buy MKT</button>
      <button onClick={()=>mkt('SELL')} className="rounded border px-3 py-1 hover:bg-white/5">Sell MKT</button>
      <button onClick={()=>limit('BUY')} className="rounded border px-3 py-1 hover:bg-white/5">Buy LMT</button>
      <button onClick={()=>limit('SELL')} className="rounded border px-3 py-1 hover:bg-white/5">Sell LMT</button>
    </div>
  )
}