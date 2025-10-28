import React, { useState, useEffect } from 'react'
import { persist, recall } from './persist.js'

function Btn({onClick, children, title, active}){
  return <button title={title} onClick={onClick} className={`px-2 py-1 rounded border text-xs ${active ? 'bg-white/10' : 'border-white/10 hover:bg-white/10'}`}>{children}</button>
}

export default function BottomBar({ timeframe, onTimeframeChange, onTimeRangeChange }){
  const [zoom, setZoom] = useState(()=> recall('ui:zoom', 1))
  useEffect(()=> persist('ui:zoom', zoom), [zoom])

  const step = (dir)=> window.dispatchEvent(new CustomEvent('chart:scroll', { detail: dir }))
  const zoomBy = (f)=>{ const z = Math.max(.5, Math.min(4, (zoom||1)*f)); setZoom(z); window.dispatchEvent(new CustomEvent('chart:zoom', { detail: z })) }
  
  const timeRanges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];

  return (
    <div className="fixed left-0 right-0 bottom-0 p-1 sm:p-2 border-t border-white/10 bg-[#0b1220]/80 backdrop-blur flex items-center gap-1 sm:gap-2 flex-wrap">
      <div className="flex items-center gap-1 sm:gap-2">
        <Btn title="للخلف" onClick={()=>step(-1)}>⟵</Btn>
        <Btn title="للأمام" onClick={()=>step(1)}>⟶</Btn>
        <Btn title="تكبير" onClick={()=>zoomBy(1.25)}>+</Btn>
        <Btn title="تصغير" onClick={()=>zoomBy(0.8)}>-</Btn>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {['1D','1W','1M'].map(x=> <Btn key={x} onClick={()=>onTimeframeChange(x)} active={timeframe===x}>{x}</Btn>)}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {timeRanges.map(x=> <button key={x} onClick={()=>onTimeRangeChange(x)} className="px-2 py-1 rounded border text-xs border-white/10 hover:bg-white/10">{x}</button>)}
      </div>
      <div className="ml-auto text-[11px] opacity-70 hidden sm:block">TF: {timeframe} · Zoom: {zoom.toFixed(2)}</div>
    </div>
  )
}