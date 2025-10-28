export type SymbolInfo = {
  ticker?: string;
  name?: string;
  exchange?: string;
  country?: string;
  iconUrl?: string;
};

function slugifyName(name: string): string {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/[\u0600-\u06FF]/g, "") // strip Arabic for slug attempts
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

import { SYMBOL_MAP } from './symbolMap';
import { EXCHANGE_DOMAINS } from './exchangeDomains';
import { COMPANY_DOMAINS } from './companyDomains';

export function buildSymbolSources({ ticker = "", name = "", exchange = "", country = "", iconUrl }: SymbolInfo): string[] {
  const t = (ticker || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const ex = (exchange || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const nm = name || "";
  const slug = slugifyName(nm);
  const list: string[] = [];
  // __MAP_PREPEND__
  // If we have a direct mapping for ticker/exchange/country, prefer it first.
  if (t && SYMBOL_MAP[t]) list.push(SYMBOL_MAP[t]);
  if (ex && SYMBOL_MAP[ex]) list.push(SYMBOL_MAP[ex]);
  if (country && SYMBOL_MAP[country.toUpperCase()]) list.push(SYMBOL_MAP[country.toUpperCase()]);


  // 1) explicit URL first (trusted)
  if (iconUrl) list.push(iconUrl);

  // 2) local assets by ticker/exchange/country (real files you provide in project)
  // Try company favicon if we know the domain
  if (t && COMPANY_DOMAINS[t]) {
    const dom = COMPANY_DOMAINS[t];
    list.push(`https://logo.clearbit.com/${dom}`);
    list.push(`https://www.google.com/s2/favicons?domain=${dom}&sz=128`);
  }

  if (t) {
    list.push(`./assets/symbols/${t}.svg`);
    list.push(`./assets/symbols/${t}.png`);
  }
  if (ex) {
    // Try favicon/logo providers based on exchange domain (if known)
    const dom = EXCHANGE_DOMAINS[ex];
    if (dom) {
      list.push(`https://logo.clearbit.com/${dom}`);
      list.push(`https://www.google.com/s2/favicons?domain=${dom}&sz=128`);
    }
    list.push(`./assets/exchanges/${ex}.svg`);
    list.push(`./assets/exchanges/${ex}.png`);
  }
  if (country) {
    const cc = country.toUpperCase().replace(/[^A-Z]/g, "");
    if (cc) {
      list.push(`./assets/flags/${cc}.svg`);
      list.push(`./assets/flags/${cc}.png`);
    }
  }

  // 3) Known remote patterns (TradingView S3 often hosts logos by slug/ticker)
  // These may not exist for every symbol; ImgSwitch will try in order.
  // Try company favicon if we know the domain
  if (t && COMPANY_DOMAINS[t]) {
    const dom = COMPANY_DOMAINS[t];
    list.push(`https://logo.clearbit.com/${dom}`);
    list.push(`https://www.google.com/s2/favicons?domain=${dom}&sz=128`);
  }

  if (t) {
    list.push(`https://s3-symbol-logo.tradingview.com/${t.toLowerCase()}.svg`);
    list.push(`https://s3-symbol-logo.tradingview.com/${t.toLowerCase()}.png`);
  }
  if (slug) {
    list.push(`https://s3-symbol-logo.tradingview.com/${slug}.svg`);
    list.push(`https://s3-symbol-logo.tradingview.com/${slug}.png`);
  }
  if (ex) {
    // Try favicon/logo providers based on exchange domain (if known)
    const dom = EXCHANGE_DOMAINS[ex];
    if (dom) {
      list.push(`https://logo.clearbit.com/${dom}`);
      list.push(`https://www.google.com/s2/favicons?domain=${dom}&sz=128`);
    }
    list.push(`https://s3-symbol-logo.tradingview.com/${ex.toLowerCase()}.svg`);
    list.push(`https://s3-symbol-logo.tradingview.com/${ex.toLowerCase()}.png`);
  }

  // Remove obvious duplicates
  return Array.from(new Set(list));
}