"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { LogoImageAlt } from "@/components/ui/LogoImageAlt";

const navLinks = [
  { href: "/fund", label: "Fund" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/research", label: "Research" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const useLightNav = pathname === "/" && !isScrolled && !isOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm/10"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 py-3 md:py-4 flex items-center justify-between">
          <LogoImageAlt
            href="/"
            size="lg"
            className={`group transition duration-300 ${useLightNav ? "brightness-0 invert" : ""}`}
          />

          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative text-sm font-medium tracking-tight transition-colors ${
                    useLightNav
                      ? "text-white/85 hover:text-white"
                      : isActive
                      ? "text-ink hover:text-ink"
                      : "text-foreground hover:text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px transition-all duration-300 ${
                      useLightNav ? "bg-white" : "bg-ink"
                    } ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
            <Link
              href="https://www.linkedin.com/company/w1-investments" target="_blank" rel="noopener noreferrer"
              className={`group inline-flex items-center gap-1.5 text-sm font-medium tracking-tight border-b pb-1 transition-colors ml-2 ${
                useLightNav
                  ? "text-white/85 border-white/30 hover:text-white hover:border-white"
                  : "border-border hover:border-ink hover:text-ink"
              }`}
            >
              LinkedIn
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 focus:outline-none focus-visible:ring-2 ring-border rounded-sm"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className={`h-px w-6 transition-transform duration-300 ${useLightNav ? "bg-white" : "bg-foreground"} ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-px w-6 transition-opacity duration-300 ${useLightNav ? "bg-white" : "bg-foreground"} ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-6 transition-transform duration-300 ${useLightNav ? "bg-white" : "bg-foreground"} ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex flex-col justify-center h-full px-8 gap-8"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl md:text-4xl font-serif tracking-tight py-2"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="https://www.linkedin.com/company/w1-investments" target="_blank" rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-3xl md:text-4xl font-serif tracking-tight py-2 mt-4"
              >
                LinkedIn →
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
