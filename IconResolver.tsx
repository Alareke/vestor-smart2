/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from 'react';
import { logoMap } from '../src/lib/logoMap';

/**
 * IconResolver
 * - REAL icon first (inside circular mask) with dark/light parity.
 * - Category pictogram fallback (still real drawing).
 * - Letter-badge LAST resort for unknown symbols only.
 * - NEW: responsive sizing via Tailwind breakpoints or fixed size (prop).
 *
 * Props:
 *  - symbol: string (required)
 *  - size?: number (fixed pixels; default 32 if responsive=false)
 *  - responsive?: boolean (if true, uses responsive sizes below)
 *  - className?: string (extra utility classes)
 *
 * Responsive scale (default):
 *  base <640px: 24px
 *  sm ≥640px:    28px
 *  md ≥768px:    32px  (watchlist default)
 *  lg ≥1024px:   36px
 *  xl ≥1280px:   40px
 */
export const IconResolver = ({
  symbol,
  size = 32,
  responsive = false,
  className = '',
}: {
  symbol: string;
  size?: number;
  responsive?: boolean;
  className?: string;
}) => {
  const key = String(symbol || '').trim().toUpperCase();
  const meta = (logoMap as any)[key] || (logoMap as any).DEFAULT || {};
  const [broken, setBroken] = useState(false);

  // Responsive class bundle (container & img fill the circle)
  const rSize =
    responsive
      ? // w/h: base=24px, sm=28px, md=32px, lg=36px, xl=40px
        'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10'
      : // fixed pixel size via inline style below
        '';

  const containerBase =
    'rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 flex items-center justify-center';

  const resolvedPath = useMemo(() => {
    const overrides = (logoMap as any).__COMMODITY_OVERRIDES__ || {};
    return (overrides[key]?.path) || meta.path;
  }, [key, meta]);

  const pictogram = useMemo(() => {
    const overrides = (logoMap as any).__COMMODITY_OVERRIDES__ || {};
    return overrides[key]?.fallback_if_missing || meta.fallback_if_missing;
  }, [key, meta]);

  // Compute inline style only for fixed-size mode
  const circleStyle: React.CSSProperties =
    responsive ? {} : { width: size, height: size };

  // REAL icon inside circle
  if (resolvedPath && !broken) {
    return (
      <div
        style={circleStyle}
        className={`${containerBase} ${rSize} ${className}`}
      >
        <img
          src={resolvedPath}
          alt={key}
          loading="lazy"
          className="w-full h-full"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  // Category pictogram (still REAL drawing)
  if (pictogram && !broken) {
    return (
      <div
        style={circleStyle}
        className={`${containerBase} ${rSize} ${className}`}
      >
        <img
          src={pictogram}
          alt={`${key}-pictogram`}
          loading="lazy"
          className="w-full h-full"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  // LAST RESORT: Letter badge for unknown/new symbols only
  const bg = meta.color || '#7A7A7A';
  const text = key.slice(0, 4);
  return (
    <div
      style={{ ...circleStyle, backgroundColor: bg, fontSize: text.length > 3 ? `${size * 0.3}px` : `${size * 0.4}px` }}
      className={`${rSize} ${containerBase} text-white font-bold uppercase ${className}`}
    >
      {text}
    </div>
  );
}