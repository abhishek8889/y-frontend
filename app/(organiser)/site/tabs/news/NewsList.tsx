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
    <section aria-label="News management" className="mt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-black uppercase leading-6">News</h3>
          <p className="mt-1 text-[12px] text-[#777]">
            Create and manage news, announcements and updates for your website.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNews}
          className="inline-flex h-[40px] shrink-0 cursor-pointer items-center gap-2 rounded border border-black bg-black px-4 text-[14px] uppercase text-white transition hover:bg-white hover:text-black"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3 w-3">
            <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Add News
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {news.map((item) => {
          const status = getStatus(item);
          const excerpt = stripHtml(item.excerptHtml);
          return (
            <article
              key={item.id}
              className="relative flex flex-col overflow-hidden border border-black/60 bg-white"
            >
              <div className="relative aspect-[16/10] bg-[#f3f3f3]">
                {item.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] uppercase text-[#999]">
                    No image
                  </div>
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status === "Published" ? "bg-[#22ad51]" : "bg-[#e7a600]"}`}
                    aria-hidden="true"
                  />
                  {status}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h4 className="line-clamp-2 text-[16px] font-black uppercase leading-5">{item.title}</h4>
                <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-[#666]">
                  {excerpt || "No short description."}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[12px] text-[#777]">
                  <div>
                    <p>{formatPublishAt(item.publishAt)}</p>
                    <p className="mt-0.5 font-medium text-black/80">{item.author}</p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Actions for ${item.title}`}
                      aria-expanded={openMenuId === item.id}
                      onClick={() =>
                        setOpenMenuId((current) => (current === item.id ? null : item.id))
                      }
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/[0.04] text-[16px] leading-none hover:bg-black/10"
                    >
                      ⋮
                    </button>
                    {openMenuId === item.id ? (
                      <div className="absolute right-0 top-10 z-10 min-w-[112px] border border-black/20 bg-white p-1 text-left shadow-md">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEditNews(item);
                          }}
                          className="block w-full px-3 py-2 text-left text-[11px] hover:bg-black/5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDeleteNews(item.id);
                          }}
                          className="block w-full px-3 py-2 text-left text-[11px] text-red-600 hover:bg-red-50"
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
