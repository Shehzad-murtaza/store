import Image from "next/image";

export function BrandLogo({ width = 132, className = "" }: { width?: number; className?: string }) {
  const height = Math.round(width * 138 / 735);
  return <Image src="/branding/shezy-logo.png" alt="SHEZY" width={width} height={height} priority style={{ width, height: "auto" }} className={`brand-logo-image mx-auto block object-contain ${className}`} />;
}
