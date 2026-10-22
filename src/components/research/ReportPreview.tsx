interface ReportPreviewProps {
  url: string;
  title: string;
}

export function ReportPreview({ url, title }: ReportPreviewProps) {
  return (
    <section
      id="pitch"
      className="mt-12 scroll-mt-28 border border-border bg-white/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          Pitch deck · preview
        </p>
        <div className="flex items-center gap-5 text-sm">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-border pb-0.5 hover:border-ink"
          >
            Open
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-border pb-0.5 hover:border-ink"
          >
            Download
          </a>
        </div>
      </div>
      <object
        data={`${url}#view=FitH`}
        type="application/pdf"
        aria-label={`${title} pitch deck`}
        className="block h-[70vh] min-h-[420px] w-full bg-[#f3efe6]"
      >
        <div className="px-6 py-16 text-center text-sm text-muted">
          <p>Your browser cannot display PDFs inline.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border-b border-border pb-1 text-ink hover:border-ink"
          >
            Open the pitch deck
          </a>
        </div>
      </object>
    </section>
  );
}
