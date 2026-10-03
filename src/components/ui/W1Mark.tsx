import Image from "next/image";

interface W1MarkProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

export function W1Mark({ size = "2xl", className = "" }: W1MarkProps) {
  const sizes = {
    sm: { width: 60, height: 30 },
    md: { width: 100, height: 50 },
    lg: { width: 160, height: 80 },
    xl: { width: 240, height: 120 },
    "2xl": { width: 320, height: 160 },
    "3xl": { width: 440, height: 220 },
  };

  return (
    <Image
      src="/w1-logo-alt.png"
      alt="W1"
      width={sizes[size].width}
      height={sizes[size].height}
      priority
      className={`object-contain ${className}`}
    />
  );
}
