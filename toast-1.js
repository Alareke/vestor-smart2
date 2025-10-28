if (!window.__toastReady) {
  window.__toastReady = true;
  const css = document.createElement('style');
  css.textContent = `
    .toast {
      position:fixed;
      right:12px;
      bottom:12px;
      background:#111827;
      color:#fff;
      padding:10px 14px;
      border-radius:10px;
      box-shadow:0 10px 30px rgba(0,0,0,.35);
      font:12px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
      opacity:.98;
      z-index:99999;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 350px;
      word-break: break-word;
    }
    .toast--error {
      background: #5f2120;
      color: #fecaca;
      border: 1px solid #dc2626;
    }
    .toast__icon {
        flex-shrink: 0;
    }
  `;
  document.head.appendChild(css);

  const createToast = (msg, type = 'info') => {
    try {
      const el = document.createElement('div');
      el.className = 'toast';
      
      let iconHtml = '';
      if (type === 'error') {
        el.classList.add('toast--error');
        // AlertTriangle icon from lucide
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast__icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      }
      
      const textEl = document.createElement('span');
      textEl.textContent = msg;

      el.innerHTML = iconHtml;
      el.appendChild(textEl);
      
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000); // Longer timeout for errors
    } catch (e) {
      console.warn('toast failed', e);
    }
  };

  window.toast = (msg) => createToast(msg, 'info');
  window.errorToast = (msg) => createToast(msg, 'error');
}