interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ size = "md", showWordmark = true, className = "" }: LogoProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg md:text-xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-4xl md:text-6xl lg:text-7xl",
  };

  const w1Size = {
    sm: "text-base",
    md: "text-lg md:text-xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-5xl md:text-7xl lg:text-8xl",
  };

  if (!showWordmark) {
    return (
      <div className={`tracking-tight leading-tight ${className}`}>
        <span className={`font-semibold tracking-[-0.03em] ${w1Size[size]}`}>W1</span>
      </div>
    );
  }

  return (
    <div className={`tracking-tight font-sans uppercase leading-tight ${sizes[size]} ${className}`}>
      <span className="font-semibold tracking-[-0.01em]">W1</span>
      <span className="mx-1.5 text-muted">|</span>
      <span className="font-medium tracking-wider">INVESTMENTS</span>
    </div>
  );
}
