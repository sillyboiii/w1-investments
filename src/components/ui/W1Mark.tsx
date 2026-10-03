import Image from "next/image";

interface W1MarkProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function W1Mark({ size = "lg", className = "" }: W1MarkProps) {
  const sizes = {
    sm: { width: 40, height: 20 },
    md: { width: 60, height: 30 },
    lg: { width: 100, height: 50 },
    xl: { width: 140, height: 70 },
    "2xl": { width: 200, height: 100 },
  };

  return (
    <Image
      src="/w1-logo.png"
      alt="W1"
      width={sizes[size].width}
      height={sizes[size].height}
      priority={size === "2xl"}
      className={`object-contain ${className}`}
    />
  );
}
