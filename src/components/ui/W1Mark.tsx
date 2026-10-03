import Image from "next/image";

interface W1MarkProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

export function W1Mark({ size = "2xl", className = "" }: W1MarkProps) {
  const sizes = {
    sm: { width: 60, height: 34 },
    md: { width: 100, height: 56 },
    lg: { width: 160, height: 90 },
    xl: { width: 240, height: 135 },
    "2xl": { width: 320, height: 180 },
    "3xl": { width: 440, height: 247 },
  };

  return (
    <Image
      src="/w1-logo.png"
      alt="W1"
      width={sizes[size].width}
      height={sizes[size].height}
      priority
      className={`object-contain ${className}`}
    />
  );
}
