import React from 'react'
import CodePreview from './CodePreview.jsx';
/** Render same symbol on multiple timeframes side by side */
export default function MultiTimeframePanel({ symbol='BTCUSD', tfs=['5m','1h','1d'] }){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-full">
      {tfs.map((tf, i)=>(
        <div key={tf+i} className="rounded-lg border border-white/10 overflow-hidden bg-[#0b1220]">
          <div className="px-2 py-1 text-xs border-b border-white/10 flex items-center justify-between">
            <div>{symbol} — {tf}</div>
          </div>
          <div className="h-[320px] md:h-[360px]">
            {/* Expect CodePreview to accept props tf/syncId */}
            <CodePreview syncId={`mtf-${i}`} initialSymbol={symbol} initialTimeframe={tf} />
          </div>
        </div>
      ))}
    </div>
  )
}