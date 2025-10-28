import React from 'react';

type Candle = {
  close?: number | null;
  volume?: number | null;
};

type VolumeProfileProps = {
  data?: Candle[];
  buckets?: number;   // عدد السلات السعرية
  maxWidth?: number;  // العرض الأقصى للشريط (px)
};

/** Simple volume profile using price buckets */
export default function VolumeProfile({
  data = [],
  buckets = 24,
  maxWidth = 160,
}: VolumeProfileProps) {
  // فلترة أي قيم غير صالحة
  const prices = data
    .map(d => (typeof d.close === 'number' ? d.close! : NaN))
    .filter(n => Number.isFinite(n)) as number[];

  const vols = data.map(d => (typeof d.volume === 'number' ? d.volume! : 0));

  if (prices.length === 0) {
    return (
      <div className="p-2 text-xs">
        <div className="opacity-70 mb-1">Volume Profile (MVP)</div>
        <div className="opacity-60">No data</div>
      </div>
    );
  }

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = Math.max(1e-9, maxP - minP); // لتجنّب القسمة على صفر لو كل الأسعار متساوية
  const N = Math.max(1, Math.floor(buckets));

  // مصفوفة تجميع الأحجام لكل سلة
  const bucketVols = new Array<number>(N).fill(0);

  // نحدد السلة لكل سعر ونجمع الحجم
  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    const vol = vols[i] ?? 0;
    let idx = Math.floor(((price - minP) / range) * N);
    if (idx >= N) idx = N - 1; // للحالات عند الحد الأعلى بالضبط
    if (idx < 0) idx = 0;
    bucketVols[idx] += vol > 0 ? vol : 0;
  }

  // نصنع تسميات السلال (نطاقات سعرية)
  const entries: Array<{ label: string; value: number }> = [];
  for (let i = 0; i < N; i++) {
    const low = minP + (range * i) / N;
    const high = minP + (range * (i + 1)) / N;
    const mid = (low + high) / 2;
    entries.push({
      label: formatPrice(mid), // يمكنك تغييره إلى `${formatPrice(low)}–${formatPrice(high)}`
      value: bucketVols[i],
    });
  }

  const maxV = Math.max(1, ...entries.map(e => e.value));

  return (
    <div className="p-2 text-xs">
      <div className="opacity-70 mb-1">Volume Profile (MVP)</div>
      <div className="flex flex-col gap-1">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="bg-white/10 h-3 rounded"
              style={{ width: (e.value / maxV) * maxWidth }}
            />
            <span className="opacity-70 tabular-nums">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPrice(n: number) {
  // تنسيق بسيط للأسعار: أرقام زوجية المسافة
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}