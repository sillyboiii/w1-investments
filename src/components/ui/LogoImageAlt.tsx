import Image from "next/image";
import Link from "next/link";

interface LogoImageAltProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  href?: string;
}

export function LogoImageAlt({
  size = "md",
  className = "",
  href,
}: LogoImageAltProps) {
  const sizes = {
    sm: { width: 120, height: 35 },
    md: { width: 170, height: 49 },
    lg: { width: 240, height: 70 },
    xl: { width: 320, height: 93 },
    "2xl": { width: 420, height: 122 },
  };

  const logo = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/w1-logo-alt.png"
        alt="W1 Investments Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        priority={size === "xl" || size === "2xl"}
        className="object-contain"
      />
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
