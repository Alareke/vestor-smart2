/** Multi-timeframe backtest — stub MVP */
export type Candle = { time:number, open:number, high:number, low:number, close:number, volume?:number };

export type BacktestRuleResult = {
  entry?: number;
  exit?: number;
};

export type BacktestRule = (p: Candle[], h: Candle[]) => BacktestRuleResult;

export function backtestMTF(
  primary: Candle[],
  higher: Candle[],
  rule: BacktestRule,
): BacktestRuleResult {
  try {
    return rule(primary, higher);
  } catch (e) {
    console.error(e);
    return {};
  }
}