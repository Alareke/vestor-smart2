import React from 'react'
/** Simple footprint mock: render per-bar bid/ask volumes */
export default function Footprint({ data=[] }){
  return (
    <div className="p-2 text-xs">
      <div className="opacity-70 mb-1">Footprint (MVP)</div>
      <div className="grid grid-cols-4 gap-1">
        {data.slice(-48).map((b, i)=> (
          <div key={i} className="px-2 py-1 rounded bg-white/5 flex justify-between">
            <span>{new Date((b.time||0)*1000).toLocaleTimeString()}</span>
            <span>{Math.round(b.volume||0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}