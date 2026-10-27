"use client";

import { useState } from "react";
import type { NewsRecord } from "./types";

type NewsListProps = {
  news: NewsRecord[];
  onAddNews: () => void;
  onEditNews: (item: NewsRecord) => void;
  onDeleteNews: (id: string) => void;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatPublishAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatus(item: NewsRecord) {
  const publishAt = new Date(item.publishAt);
  if (Number.isNaN(publishAt.getTime())) return "Draft";
  return publishAt.getTime() <= Date.now() ? "Published" : "Scheduled";
}

export default function NewsList({ news, onAddNews, onEditNews, onDeleteNews }: NewsListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <section aria-label="News management" className="site-tab">
      <div className="site-news-header">
        <div>
          <h3 className="site-tab-title">News</h3>
          <p className="site-tab-subtitle">
            Create and manage news, announcements and updates for your website.
          </p>
        </div>
        <button type="button" onClick={onAddNews} className="page-primary-button-action">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="12" height="12">
            <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Add News
        </button>
      </div>

      <div className="site-news-grid">
        {news.map((item) => {
          const status = getStatus(item);
          const excerpt = stripHtml(item.excerptHtml);
          const statusDotClass =
            status === "Published"
              ? "site-status-dot site-status-dot-ok"
              : status === "Scheduled"
                ? "site-status-dot site-status-dot-warn"
                : "site-status-dot";
          return (
            <article key={item.id} className="site-news-card">
              <div className="site-news-card-media">
                {item.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageDataUrl} alt="" />
                ) : (
                  <div className="site-news-card-placeholder">No image</div>
                )}
                <span className="site-status-pill">
                  <span className={statusDotClass} aria-hidden="true" />
                  {status}
                </span>
              </div>

              <div className="site-news-card-body">
                <h4 className="site-news-card-title">{item.title}</h4>
                <p className="site-news-card-excerpt">{excerpt || "No short description."}</p>
                <div className="site-news-card-meta">
                  <div>
                    <p>{formatPublishAt(item.publishAt)}</p>
                    <p className="site-news-card-author">{item.author}</p>
                  </div>
                  <div className="site-news-menu-wrap">
                    <button
                      type="button"
                      aria-label={`Actions for ${item.title}`}
                      aria-expanded={openMenuId === item.id}
                      onClick={() =>
                        setOpenMenuId((current) => (current === item.id ? null : item.id))
                      }
                      className="site-news-menu-trigger"
                    >
                      ⋮
                    </button>
                    {openMenuId === item.id ? (
                      <div className="site-news-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEditNews(item);
                          }}
                          className="site-news-menu-item"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDeleteNews(item.id);
                          }}
                          className="site-news-menu-item site-news-menu-item-danger"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
