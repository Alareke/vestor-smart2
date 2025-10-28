/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react'

/* AUTO: TopToolbar actions */
import { persist, recall } from './persist.js'
import ProvidersSwitcher from './ProvidersSwitcher.jsx'
import QuickOrderPanel from './QuickOrderPanel.jsx'

function TopButton({title, onClick, children}){
  return <button title={title} onClick={onClick} className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-xs">{children}</button>
}

export default function Toolbar(){
  const [symbol, setSymbol] = useState(()=> recall('ui:symbol', 'BTCUSD'))
  const [tf, setTf] = useState(()=> recall('ui:tf', '1h'))
  const [type, setType] = useState(()=> recall('ui:ctype', 'candles'))
  const [sync, setSync] = useState(()=> recall('ui:sync', true))

  useEffect(()=>{ persist('ui:symbol', symbol); window.stockSymbol = symbol; window.dispatchEvent(new CustomEvent('chart:symbol',{detail: symbol})) },[symbol])
  useEffect(()=>{ persist('ui:tf', tf); window.dispatchEvent(new CustomEvent('chart:tf',{detail: tf})) },[tf])
  useEffect(()=>{ persist('ui:ctype', type); window.dispatchEvent(new CustomEvent('chart:type',{detail: type})) },[type])
  useEffect(()=>{ persist('ui:sync', sync); window.dispatchEvent(new CustomEvent('grid:sync:toggle',{detail: !!sync})) },[sync])

  const doSearch = () => window.dispatchEvent(new CustomEvent('search:open'));

  const saveLayout = ()=>{
    try{
      const layout = {
        symbol, tf, type, sync,
        watchlist: recall('watchlist', []),
        tools: recall('draw:objects', []),
        indicators: recall('ind:configs', [])
      }
      const key = 'layout:' + new Date().toISOString()
      localStorage.setItem(key, JSON.stringify(layout))
      window.toast && window.toast('Layout saved ✓')
    }catch(e){ console.warn(e) }
  }

  const cloudSync = ()=>{
    window.toast && window.toast('Cloud sync (stub). وصّل حسابك لاحقًا.')
  }

  const reloadAll = ()=> window.dispatchEvent(new CustomEvent('chart:reload'))

  return (
    <div className="flex items-center gap-2 p-2">
      <TopButton title="بحث" onClick={doSearch}>بحث</TopButton>
      <input className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs w-28" value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} />
      <select className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs" value={tf} onChange={e=>setTf(e.target.value)}>
        {['1m','5m','15m','1h','4h','1d','1w','1M'].map(x=> <option key={x} value={x}>{x}</option>)}
      </select>
      <select className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs" value={type} onChange={e=>setType(e.target.value)}>
        <option value="candles">شموع</option>
        <option value="line">خط</option>
        <option value="heikin">هايكن آشي</option>
      </select>
      <label className="flex items-center gap-1 text-xs px-2 py-1 border border-white/10 rounded">
        <input type="checkbox" checked={!!sync} onChange={e=>setSync(e.target.checked)} />
        مزامنة الشبكة
      </label>
      <TopButton title="حفظ" onClick={saveLayout}>حفظ</TopButton>
      <TopButton title="سحابة" onClick={cloudSync}>سحابة</TopButton>
      <TopButton title="تحديث" onClick={reloadAll}>تحديث</TopButton>

      <div className="ml-auto flex items-center gap-2">
        <ProvidersSwitcher/>
        <QuickOrderPanel/>
      </div>
    </div>
  )
}