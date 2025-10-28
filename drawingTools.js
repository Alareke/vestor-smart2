// Drawing tools defaults & presets
export const TOOL_DEFAULTS = {
  trendline: { color:'#22c55e', width:2, dash:[], opacity:1 },
  ray:       { color:'#22c55e', width:2, dash:[6,4], opacity:1 },
  hline:     { color:'#eab308', width:2, dash:[4,4], opacity:1 },
  hline_alert:{ color:'#eab308', width:2, dash:[4,4], opacity:1 },
  channel:   { color:'#60a5fa', width:2, dash:[], opacity:.4 },
  fib_retracement: { color:'#f97316', levels:[0,0.236,0.382,0.5,0.618,0.786,1], width:2, opacity:.8 },
  fib_extension:   { color:'#fb7185', levels:[1,1.272,1.414,1.618,2,2.618], width:2, opacity:.8 },
  gann_box:  { color:'#8b5cf6', width:1, opacity:.2 },
  gann_square:{ color:'#a78bfa', width:1, opacity:.2 },
  gann_fan: { color: '#c084fc', width: 1, opacity: 0.7 },
  rect:      { color:'#3b82f6', fill:'#3b82f622', width:1, opacity:.6 },
  ellipse:   { color:'#10b981', fill:'#10b98122', width:1, opacity:.6 },
  triangle:  { color:'#f59e0b', fill:'#f59e0b22', width:1, opacity:.6 },
  arrow:     { color:'#f43f5e', width:2, opacity:1 },
  text:      { color:'#e5e7eb', size:12, bg:'transparent' },
  note:      { color:'#e5e7eb', size:12, bg:'#111827aa' },
  price_label:{ color:'#e5e7eb', size:12, bg:'#1f2937' },
  measure_price:{ color:'#eab308', width:1 },
  measure_time:{ color:'#eab308', width:1 },
  measure_box:{ color:'#eab308', width:1, opacity:.2 },
};

const PKEY = 'tool:preset:';
export function getToolPreset(tool) {
  try {
    const raw = localStorage.getItem(PKEY + tool);
    if (raw && raw !== 'null' && raw !== 'undefined') {
      return JSON.parse(raw);
    }
    return null;
  } catch {
    return null;
  }
}
export function saveToolPreset(tool, cfg){
  try{ localStorage.setItem(PKEY+tool, JSON.stringify(cfg)) }catch{}
}
export function getToolConfig(tool){
  const preset = getToolPreset(tool);
  return preset || TOOL_DEFAULTS[tool] || { color:'#e5e7eb', width:1 };
}