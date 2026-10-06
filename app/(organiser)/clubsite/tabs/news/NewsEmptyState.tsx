type NewsEmptyStateProps = {
  onAddNews: () => void;
};

function AddNewsButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[34px] items-center justify-center gap-2 rounded-[3px] border border-black bg-black px-4 text-[10px] uppercase text-white transition hover:bg-white hover:text-black ${className}`}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3 w-3">
        <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      Add News
    </button>
  );
}

export default function NewsEmptyState({ onAddNews }: NewsEmptyStateProps) {
  return (
    <section aria-label="News management" className="mt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-black uppercase leading-6">News</h3>
          <p className="mt-1 text-[12px] text-[#777]">
            Create and manage news, announcements and updates for your website.
          </p>
        </div>
        <AddNewsButton onClick={onAddNews} className="shrink-0" />
      </div>

      <div className="flex min-h-[min(54vh,440px)] flex-col items-center justify-center px-4 text-center">
        <h4 className="text-[16px] font-black uppercase leading-6">No news added yet</h4>
        <p className="mt-2 text-[11px] text-[#777]">Add news, announcements and updates for your website.</p>
        <AddNewsButton onClick={onAddNews} className="mt-3 min-w-[132px]" />
      </div>
    </section>
  );
}
