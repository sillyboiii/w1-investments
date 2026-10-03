# W1 Investments

W1 Investments is a student-led investment organisation being developed at the University of Westminster in London. This is a polished, production-ready website built with Next.js, TypeScript, Tailwind CSS and Framer Motion.

## Design Philosophy

- Editorial, modern and institutional aesthetic
- Warm cream/off-white primary background
- Strong editorial serif for headlines, clean sans-serif for body/navigation
- Lots of whitespace, strong editorial grid, thin rules
- Restrained use of monochrome/desaturated photography
- Slash motif as a recurring graphic device
- Sophistication through typography, research, information design, whitespace and consistency

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first styling
- [Framer Motion](https://motion.dev/) - Subtle animations and transitions
- [Vercel](https://vercel.com/) - Hosting and deployment

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── layout/       # Navbar, Footer
│   └── ui/           # Reusable UI components
├── data/             # Structured content/data (separated from components)
└── lib/              # Utilities and helpers
```

## Deployment

Deployment flow: **GitHub → Vercel → Production**

- Every push to the `main` branch triggers a production deployment on Vercel
- Pull requests and other branches create Vercel preview deployments
- The repository is the source of truth

## Contributing

This project is set up cleanly for future contributors. Keep content/data separated from components wherever practical so team members can update research pieces, portfolio information and opportunities without rebuilding the site's architecture.

## Important Notes

- The live portfolio backend has not been implemented yet. Components and structure are in place for future integration when the portfolio/risk framework is finalised.
- W1 initially operates using a model/simulated portfolio, not real client or university capital.
- Content published by W1 is for educational and research purposes only and does not constitute investment advice.
- Avoid implying official University of Westminster endorsement/funding unless approval is obtained. Use "Founded by students at the University of Westminster" where appropriate.
