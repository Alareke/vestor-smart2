import React, { useState } from "react";

export default function SafeImg({
  src,
  alt,
  size = 20,
  rounded = true,
  className = "",
  label = "",
}: {
  src?: string;
  alt?: string;
  size?: number;
  rounded?: boolean;
  className?: string;
  label?: string; // text badge fallback, e.g., ticker initials
}) {
  const [current, setCurrent] = useState<string | undefined>(src);
  const [broken, setBroken] = useState<boolean>(false);

  const onError = () => {
    setBroken(true);
  };

  const radius = rounded ? "rounded-full" : "rounded-md";
  const sizeStyle = { width: size, height: size };

  if (broken || !current) {
    const initials =
      (label || alt || "")
        .toString()
        .replace(/[^A-Za-z0-9\u0600-\u06FF]+/g, " ")
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase() || "–";

    return (
      <div
        className={`${radius} flex items-center justify-center bg-gray-700 text-white text-[10px] font-bold ${className}`}
        style={sizeStyle}
        aria-label={alt}
        title={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={current}
      alt={alt}
      onError={onError}
      className={`${radius} object-contain bg-transparent ${className}`}
      style={sizeStyle}
      loading="lazy"
      decoding="async"
    />
  );
}