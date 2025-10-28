import React from "react";

type Props = {
  code?: string;                // e.g., "USD", "BTC"
  size?: number;                // pixel size (width & height)
  className?: string;           // extra CSS classes
  title?: string;               // <title> for accessibility
  fallbackCode?: string;        // fallback currency code if icon missing
};

const AVAILABLE = new Set<string>([
  "USD","EUR","GBP","JPY","CNY","SAR","AED","KWD","INR","TRY",
  "BTC","ETH","USDT","BNB","XRP","SOL","TRX","DOGE","ADA","MATIC"
]);

export function currencyIconPath(code?: string, fallbackCode: string = "USD") {
  const c = (code || "").toUpperCase();
  const finalCode = AVAILABLE.has(c) ? c : (AVAILABLE.has(fallbackCode.toUpperCase()) ? fallbackCode.toUpperCase() : "USD");
  return `/assets/icons/currencies/${finalCode}.svg`;
}

export const CurrencyIcon: React.FC<Props> = ({ code, size = 20, className = "", title, fallbackCode = "USD" }) => {
  const src = currencyIconPath(code, fallbackCode);
  const label = title || (code ? `${code.toUpperCase()} icon` : "Currency icon");
  return (
    <img
      src={src}
      alt={label}
      title={label}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      style={{ inlineSize: size, blockSize: size }}
    />
  );
};