import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PortfolioView from "./portfolio-view";

export default function PortfolioPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <section>
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05]">
                PORTFOLIO
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4 max-w-3xl">
                Simulated investment portfolio tracked with live market data.
              </p>
            </div>
          </div>
        </section>
        <PortfolioView />
      </main>
      <Footer />
    </div>
  );
}
