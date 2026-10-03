import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  external = false,
  ariaLabel,
}: ButtonProps) {
  const baseClasses =
    "group inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 ring-border rounded-sm";

  const variantClasses = {
    primary:
      "bg-ink text-white hover:bg-charcoal border border-ink",
    secondary:
      "bg-background text-foreground border border-border hover:border-ink hover:text-ink",
    tertiary:
      "text-foreground hover:text-ink border-b border-transparent hover:border-ink pb-1 px-0",
    ghost: "text-foreground hover:text-ink px-0",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          aria-label={ariaLabel}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
