import Image from "next/image";

export function RemoteImage({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  let safeSrc: string | null = null;
  try {
    const url = new URL(src);
    if (url.protocol === "https:" || url.protocol === "http:") safeSrc = url.toString();
  } catch {
    safeSrc = null;
  }

  if (!safeSrc) return null;
  return <Image src={safeSrc} alt={alt} fill sizes={sizes} unoptimized className={className} />;
}
