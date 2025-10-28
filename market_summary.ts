export function buildMarketSummary(tickers:string[], data:Record<string, any[]>){
  return tickers.map(t=>{
    const arr = data[t]||[]
    const last = arr[arr.length-1]||{}
    return `• ${t}: close=${last.close} vol=${last.volume}`
  }).join('\n')
}