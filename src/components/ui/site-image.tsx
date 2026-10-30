import Image, { type ImageProps } from "next/image";

/**
 * next/image that skips the optimizer for SVGs (the generated artwork).
 * Raster images go through the optimizer as normal.
 */
export function SiteImage({ alt, unoptimized, ...props }: ImageProps) {
  const isSvg = typeof props.src === "string" && props.src.endsWith(".svg");
  return <Image alt={alt} unoptimized={unoptimized ?? isSvg} {...props} />;
}
