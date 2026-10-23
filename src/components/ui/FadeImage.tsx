"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image that fades in once loaded. If it fails (e.g. offline and never
 * viewed), it stays invisible so the backdrop shows instead of a broken icon.
 */
export function FadeImage({ alt, className = "", ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`motion-safe:transition motion-safe:duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
