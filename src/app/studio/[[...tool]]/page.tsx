"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-2xl border-y border-border py-10">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted">W1 Studio</p>
          <h1 className="text-4xl font-serif tracking-tight">Connect Sanity first.</h1>
          <p className="mt-6 text-muted leading-relaxed">
            Add your Sanity project values to Vercel environment variables, then redeploy.
          </p>
          <div className="mt-8 space-y-2 text-sm text-muted">
            <p>NEXT_PUBLIC_SANITY_PROJECT_ID</p>
            <p>NEXT_PUBLIC_SANITY_DATASET</p>
            <p>NEXT_PUBLIC_SANITY_API_VERSION</p>
          </div>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
