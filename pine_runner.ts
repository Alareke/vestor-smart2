/** Minimal Pine-like runner (subset) — MVP */
export type Series = number[];
export function sma(src: Series, len: number){ const out:number[]=[]; let s=0; for(let i=0;i<src.length;i++){ s+=src[i]; if(i>=len) s-=src[i-len]; out.push(i+1>=len? s/len : NaN) } return out }
export function ema(src: Series, len: number){ const out:number[]=[]; const k=2/(len+1); let e=src[0]||0; for(let i=0;i<src.length;i++){ e = src[i]*k + e*(1-k); out.push(e) } return out }
export function rsi(src: Series, len: number){ const out:number[]=[]; let up=0, dn=0; for(let i=1;i<src.length;i++){ const ch=src[i]-src[i-1]; up = (up*(len-1)+Math.max(ch,0))/len; dn = (dn*(len-1)+Math.max(-ch,0))/len; const rs = dn===0? 100 : 100-100/(1+up/dn); out.push(rs) } out.unshift(NaN); return out }

export function macd(src: Series, fastLen: number, slowLen: number, sigLen: number): [Series, Series, Series] {
  const fastMA = ema(src, fastLen);
  const slowMA = ema(src, slowLen);
  
  const macdLine: Series = fastMA.map((val, i) => val - slowMA[i]);
  const signalLine = ema(macdLine, sigLen);
  const histLine: Series = macdLine.map((val, i) => val - signalLine[i]);

  return [macdLine, signalLine, histLine];
}

export const stdlib = { sma, ema, rsi, macd };
export function runPine(code:string, seriesMap:Record<string,Series>){
  // Super simplified: support lines like: out = sma(close,14)
  const ctx:any = { ...stdlib, ...seriesMap, plot:(x:any)=>x, inputs:(x:any)=>x };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...Object.keys(ctx), code);
    return fn(...Object.values(ctx));
  } catch (e){ console.error('pine run error', e); return null; }
}