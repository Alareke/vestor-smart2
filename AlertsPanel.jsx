import React from 'react'
import { useUIStore } from './ui.ts'

export default function AlertsPanel(){
  const { rightbar, toggle } = useUIStore()
  if (!rightbar.alertsOpen) return null
  return (
    <div className="fixed right-12 top-12 w-80 rounded-xl border border-white/10 bg-[#0b1220] p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">التنبيهات</div>
        <button onClick={()=>toggle('alertsOpen')} className="text-xs rounded border px-2 py-1 hover:bg-white/5">إغلاق</button>
      </div>
      <div className="text-xs opacity-70 mb-2">يعرض التنبيهات المُسجلة (HLine/Zone) ويتلقى إشعارًا عند تحقق الشرط.</div>
      <div id="alerts-list" className="text-xs">— سيتم ملؤها من محرك التنبيهات.</div>
    </div>
  )
}