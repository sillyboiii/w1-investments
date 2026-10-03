import Image from "next/image";
import Link from "next/link";

interface LogoImageProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  href?: string;
}

export function LogoImage({
  size = "md",
  showText = true,
  className = "",
  href,
}: LogoImageProps) {
  const sizes = {
    sm: { width: 60, height: 30 },
    md: { width: 80, height: 40 },
    lg: { width: 120, height: 60 },
    xl: { width: 180, height: 90 },
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm md:text-base",
    lg: "text-lg md:text-xl",
    xl: "text-2xl md:text-3xl",
  };

  const logo = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/w1-logo.png"
        alt="W1 Investments Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        priority={size === "xl"}
        className="object-contain"
      />
      {showText && (
        <span className={`tracking-tight font-sans uppercase ${textSizes[size]} leading-tight whitespace-nowrap`}>
          <span className="font-medium tracking-wider">INVESTMENTS</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
