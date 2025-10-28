// Keyboard shortcuts for chart UI
if (window.__kbShortcutsReady) {
  // already loaded, do nothing
} else {
  window.__kbShortcutsReady = true;

  function safeRecall(key, fallback) {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null || storedValue === 'undefined') {
        return fallback;
      }
      return JSON.parse(storedValue);
    } catch (e) {
      console.warn(`Could not recall ${key} from localStorage`, e);
      return fallback;
    }
  }

  const types = ['candles','line','heikin'];
  function nextType(cur){
    const i = Math.max(0, types.indexOf(cur||'candles'));
    return types[(i+1)%types.length];
  }

  function isTypingTarget(el){
    if (!el) return false;
    const tag = (el.tagName||'').toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function saveLayout(){
    try{
      const symbol = (window.stockSymbol || 'BTCUSD');
      const tf = safeRecall('ui:tf', '1h');
      const type = safeRecall('ui:ctype', 'candles');
      const sync = safeRecall('ui:sync', true);
      const layout = {
        symbol, tf, type, sync,
        watchlist: safeRecall('watchlist', []),
        tools: safeRecall('draw:objects', []),
        indicators: safeRecall('ind:configs', [])
      };
      const key = 'layout:' + new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(layout));
      window.toast && window.toast('Layout saved (S) ✓');
    }catch(e){ console.warn('save layout failed', e); }
  }

  function onKey(e){
    if (isTypingTarget(document.activeElement)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const k = (e.key||'').toLowerCase();
    if (k === 't'){
      e.preventDefault();
      const cur = safeRecall('ui:ctype', 'candles');
      const nxt = nextType(cur);
      localStorage.setItem('ui:ctype', JSON.stringify(nxt));
      window.dispatchEvent(new CustomEvent('chart:type', { detail: nxt }));
      window.toast && window.toast('Chart type → ' + nxt);
      return;
    }
    if (k === 's'){
      e.preventDefault();
      saveLayout();
      return;
    }
    if (k === 'r'){
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('chart:reload'));
      window.toast && window.toast('Reload (R)');
      return;
    }
  }

  document.addEventListener('keydown', onKey);
  console.log('[shortcuts] T=type, S=save, R=reload');
}