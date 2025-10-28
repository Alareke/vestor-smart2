import React, { useState } from 'react'

function safeRecallJournal() {
    try {
        const stored = localStorage.getItem('journal');
        if (stored === null || stored === 'undefined' || stored === 'null') {
            return [];
        }
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function TradingJournal(){
  const [items,setItems]=useState(safeRecallJournal);
  const add = ()=>{
    const id = Date.now()
    const entry = { id, ts: new Date().toISOString(), note }
    const next = [entry, ...items]; setItems(next); localStorage.setItem('journal', JSON.stringify(next))
  }
  const del = (id)=>{ const next = items.filter(x=>x.id!==id); setItems(next); localStorage.setItem('journal', JSON.stringify(next)) }
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm">Trading Journal</div>
        <button onClick={add} className="text-xs rounded border px-2 py-1 hover:bg-white/5">إضافة</button>
      </div>
      <div className="flex flex-col gap-2 text-xs">
        {items.map(it => (
          <div key={it.id} className="rounded border border-white/10 p-2">
            <div className="opacity-70">{it.ts}</div>
            <div>{it.note}</div>
            <div className="mt-1"><button onClick={()=>del(it.id)} className="text-[11px] rounded border px-2 py-0.5 hover:bg-white/5">حذف</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}