import React, { useState, useEffect } from 'react'
import { useSearchStore } from './ui.ts'
import * as WL from './watchlists.js'

const cats = ['stocks','futures','forex','crypto','indices','etfs','bonds','commodities','watchlists']
const labels = { stocks:'الأسهم', futures:'العقود الآجلة', forex:'فوركس', crypto:'كريبتو', indices:'المؤشرات', etfs:'صناديق (ETF)', bonds:'السندات', commodities:'السلع', watchlists:'القوائم' }

function match(q, item){
  if (!q) return true
  const s = (item.symbol + ' ' + item.name + ' ' + item.exchange).toLowerCase()
  return s.includes(q.toLowerCase())
}

export default function SymbolSearchModal(){
  const [allSymbols, setAllSymbols] = useState([]);
  const [wlNames, setWlNames] = useState([])
  const [activeList, setActiveList] = useState('')
  const [wlItems, setWlItems] = useState([])
  const [tab, setTab] = useState('stocks')
  const { search, setSearch } = useSearchStore()

  useEffect(() => {
    fetch('./symbols_catalog.json')
      .then(res => res.json())
      .then(setAllSymbols)
      .catch(err => {
          console.error("Failed to load symbols catalog", err);
          window.errorToast?.(`Could not load symbols catalog: ${err.message}`);
      });
  }, []);

  useEffect(()=>{
    const init = async () => {
        try {
            await WL.ensureDefault();
            const names = await WL.listNames();
            setWlNames(names);
            const firstList = names[0] || '';
            setActiveList(firstList);
            if(firstList) {
                const items = await WL.getList(firstList);
                setWlItems(items);
            }
        } catch (e) {
            console.error("Failed to init watchlists in search modal", e);
            window.errorToast?.(`Could not load watchlists: ${e.message}`);
        }
    };
    init();
  },[]);

  useEffect(()=>{
    const loadWatchlistItems = async () => {
        if (tab === 'watchlists') {
            const names = await WL.listNames();
            setWlNames(names);
            if(activeList){ 
                const items = await WL.getList(activeList);
                setWlItems(items);
            }
        }
    };
    loadWatchlistItems();
  },[tab, activeList]);

  useEffect(()=>{
    function onOpen(){ setSearch({ open: true }) }
    window.addEventListener('search:open', onOpen)
    return ()=> window.removeEventListener('search:open', onOpen)
  },[setSearch])

  if (!search?.open) return null

  const list = tab==='watchlists' ? wlItems.filter(item => match(search.q, item)) : allSymbols.filter(x=> x.category===tab && match(search.q, x)).slice(0, 500)

  const pick = (it)=>{
    setSearch({ open: false })
    try{
      localStorage.setItem('ui:symbol', JSON.stringify(it.symbol))
      window.stockSymbol = it.symbol
      window.dispatchEvent(new CustomEvent('chart:symbol', { detail: it.symbol }))
      window.toast && window.toast(`تم اختيار ${it.symbol}`)
      useSearchStore.getState().addRecent(it.symbol);
    }catch(e){}
  }

  const handleAddSymbol = async (e, it) => {
    e.stopPropagation(); 
    if(!activeList){ alert('اختر قائمة أولاً'); return } 
    await WL.addSymbol(activeList, it);
    if(tab === 'watchlists') {
        const items = await WL.getList(activeList);
        setWlItems(items);
    }
    window.toast && window.toast(`Added ${it.symbol} to ${activeList}`);
  };
  
  const handleRemoveSymbol = async (e, it) => {
    e.stopPropagation();
    await WL.removeSymbol(activeList, it.symbol); 
    const items = await WL.getList(activeList);
    setWlItems(items);
  }

  const handleCreateList = async () => {
      if(n){ 
          await WL.addList(n); 
          const names = await WL.listNames();
          setWlNames(names); 
          setActiveList(n); 
          const items = await WL.getList(n);
          setWlItems(items);
      }
  };

  const handleImport = (e) => {
    const f=e.target.files?.[0]; 
    if(!f) return; 
    const r=new FileReader(); 
    r.onload= async ()=>{ 
        try{ 
            await WL.importAll(JSON.parse(r.result)); 
            const names = await WL.listNames();
            setWlNames(names); 
            const firstList = names[0]||'';
            setActiveList(firstList); 
            if(firstList) {
              const items = await WL.getList(firstList);
              setWlItems(items);
            }
        } catch(err){ 
            alert('فشل الاستيراد');
        } 
    }; 
    r.readAsText(f);
  };


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-2 sm:p-4 md:p-8" onClick={() => setSearch({ open: false })}>
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl h-full sm:h-auto sm:max-h-[85vh] rounded-xl bg-[#0b1220] border border-white/10 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-shrink-0">
          <input autoFocus value={search.q} onChange={e=>setSearch({ q: e.target.value })} placeholder="ابحث بالرمز/الاسم/البورصة..." className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2 text-sm" />
          <button onClick={()=>setSearch({ open: false })} className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/10">إغلاق</button>
        </div>
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-2 overflow-y-auto">
            {cats.map(c=>(
              <button key={c} onClick={()=>setTab(c)} className={`w-full text-left md:text-right px-2 py-1 rounded text-sm ${tab===c ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                {labels[c]}
              </button>
            ))}
            {tab==='watchlists' && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs opacity-70">قوائم المستخدم</div>
                  <div className="flex gap-1">
                    <button onClick={handleCreateList} className="text-[11px] border px-2 py-0.5 rounded hover:bg-white/10">إنشاء</button>
                    <button onClick={async ()=>{ const p = await WL.exportAll(); const blob = new Blob([JSON.stringify(p, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='watchlists.json'; a.click(); URL.revokeObjectURL(url); }} className="text-[11px] border px-2 py-0.5 rounded hover:bg-white/10">تصدير</button>
                    <label className="text-[11px] border px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer">
                      استيراد
                      <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {wlNames.map(n=>(
                    <button key={n} onClick={async ()=>{ setActiveList(n); setWlItems(await WL.getList(n)); }} className={`w-full text-left md:text-right px-2 py-1 rounded text-sm ${activeList===n ? 'bg-white/15' : 'hover:bg-white/5'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4">
                <div className="text-xs opacity-70 px-2 mb-2">Recent</div>
                <div className="flex flex-col gap-1">
                    {search.recent.map(r => (
                        <button key={r} onClick={() => pick({ symbol: r })} className="w-full text-left md:text-right px-2 py-1 rounded text-sm font-mono hover:bg-white/5">
                            {r}
                        </button>
                    ))}
                </div>
            </div>
          </aside>
        
          
          <main className="flex-1 p-2 h-[50vh] md:h-[600px] overflow-y-auto">
            {tab!=='watchlists' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {list.map((it,idx)=>(
                  <button key={idx} onClick={()=>pick(it)} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 border border-white/5 text-sm text-left">
                    <div className="font-mono w-24 sm:w-28 truncate">{it.symbol}</div>
                    <div className="flex-1">
                      <div className="truncate">{it.name}</div>
                      <div className="opacity-60 text-[11px]">{labels[it.category]} • {it.exchange}</div>
                    </div>
                    <div>
                      <button onClick={(e)=> handleAddSymbol(e, it)} className="text-[11px] border px-2 py-0.5 rounded hover:bg-white/10">+ للقائمة</button>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {tab==='watchlists' && (
              <div className="flex flex-col gap-1">
                {list.map((it,idx)=>(
                  <div key={idx} className="flex items-center gap-2 px-2 py-2 rounded border border-white/10">
                    <button onClick={()=>pick(it)} className="font-mono w-28 text-left hover:underline">{it.symbol}</button>
                    <div className="flex-1">
                      <div>{it.name}</div>
                      <div className="opacity-60 text-[11px]">{labels[it.category]||''} • {it.exchange||''}</div>
                    </div>
                    <button onClick={(e)=> handleRemoveSymbol(e, it)} className="text-[11px] border px-2 py-0.5 rounded hover:bg-white/10">حذف</button>
                  </div>
                ))}
                {!list.length && <div className="text-xs opacity-70 p-2">
                    {search.q ? 'No results found.' : 'القائمة فارغة — اختر تبويب فئة وأضف رموزًا بزر “+ للقائمة”.'}
                </div>}
              </div>
            )}
          </main>
        
        </div>
      </div>
    </div>
  )
}