import Image from "next/image";
import Link from "next/link";

interface LogoImageAltProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  href?: string;
}

export function LogoImageAlt({
  size = "md",
  showText = true,
  className = "",
  href,
}: LogoImageAltProps) {
  const sizes = {
    sm: { width: 70, height: 35 },
    md: { width: 90, height: 45 },
    lg: { width: 130, height: 65 },
    xl: { width: 190, height: 95 },
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm md:text-base",
    lg: "text-lg md:text-xl",
    xl: "text-2xl md:text-3xl",
  };

  const logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/w1-logo-alt.png"
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
