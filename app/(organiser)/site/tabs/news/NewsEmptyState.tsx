type NewsEmptyStateProps = {
  onAddNews: () => void;
};

function AddNewsButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`page-primary-button-action ${className}`.trim()}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="12" height="12">
        <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      Add News
    </button>
  );
}

export default function NewsEmptyState({ onAddNews }: NewsEmptyStateProps) {
  return (
    <section aria-label="News management" className="site-tab">
      <div className="site-news-header">
        <div>
          <h3 className="site-tab-title site-tab-title-lg">News</h3>
          <p className="site-tab-subtitle site-tab-subtitle-md">
            Create and manage news, announcements and updates for your website.
          </p>
        </div>
        <AddNewsButton onClick={onAddNews} />
      </div>

      <div className="site-empty">
        <h4 className="site-empty-title">No news added yet</h4>
        <p className="site-empty-copy">Add news, announcements and updates for your website.</p>
        <div className="site-empty-action">
          <AddNewsButton onClick={onAddNews} />
        </div>
      </div>
    </section>
  );
}
