import React, { useEffect, useState } from "react";
import SafeImg from "./SafeImg";

/**
 * ImgSwitch
 * - Receives a list of candidate real image URLs.
 * - Tries them in order until one loads successfully.
 * - If all fail, renders a fallback placeholder with initials.
 */
export default function ImgSwitch({
  sources,
  alt = "",
  size = 20,
  rounded = true,
  className = "",
}: {
  sources: string[];
  alt?: string;
  size?: number;
  rounded?: boolean;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [isOk, setIsOk] = useState(false);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setIdx(0);
    setIsOk(false);
    setAllFailed(false);
  }, [sources]);

  const activeSrc = sources[idx];

  if (allFailed) {
    return (
      <SafeImg
        label={alt}
        alt={alt}
        size={size}
        rounded={rounded}
        className={className}
      />
    );
  }

  if (isOk) {
    const radius = rounded ? "rounded-full" : "rounded-md";
    const style = { width: size, height: size };
    return (
      <img
        src={activeSrc}
        alt={alt}
        className={`${radius} object-contain ${className}`}
        style={style}
        loading="lazy"
        decoding="async"
      />
    );
  }
  
  if (activeSrc) {
    return (
      <img
        src={activeSrc}
        alt={alt}
        className="sr-only"
        onLoad={() => setIsOk(true)}
        onError={() => {
          if (idx < sources.length - 1) {
            setIdx(idx + 1);
          } else {
            setAllFailed(true);
          }
        }}
      />
    );
  }
  
  // If sources are empty or something went wrong, render fallback
  return (
      <SafeImg
        label={alt}
        alt={alt}
        size={size}
        rounded={rounded}
        className={className}
      />
  );
}