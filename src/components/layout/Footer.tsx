import Link from "next/link";

const footerLinks = [
  { href: "/research", label: "Research" },
  { href: "/fund", label: "Fund" },
  { href: "/academy", label: "Academy" },
  { href: "/team", label: "Team" },
  { href: "/join", label: "Join" },
];

const socialLinks = [
  { href: "https://www.linkedin.com/company/w1investments", label: "LinkedIn", external: true },
  { href: "https://x.com/w1investments", label: "X", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl tracking-tight font-sans uppercase mb-4">
              <span className="font-semibold tracking-[-0.01em]">W1</span>
              <span className="mx-1.5 text-muted">|</span>
              <span className="font-medium tracking-wider">INVESTMENTS</span>
            </h2>
            <p className="text-sm text-muted max-w-md leading-relaxed">
              London
            </p>
          </div>

          <div>
            <h3 className="text-xs font-sans font-medium tracking-widest uppercase text-muted mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-sans font-medium tracking-widest uppercase text-muted mb-4">
              Connect
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm hover:text-ink transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <p className="text-xs text-muted leading-relaxed max-w-3xl">
              W1 is a student-led educational investment organisation. Content published by W1 is for educational and research purposes only and does not constitute investment advice.
            </p>
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} W1 Investments
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
