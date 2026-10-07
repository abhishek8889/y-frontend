"use client";

import { useState } from "react";
import type { NewsRecord } from "./types";

type NewsListProps = {
  news: NewsRecord[];
  onAddNews: () => void;
  onEditNews: (item: NewsRecord) => void;
  onDeleteNews: (id: string) => void;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB");
}

function formatTime(time: string) {
  const [hours = "0", minutes = "00"] = time.split(":");
  const hour = Number(hours);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function getStatus(item: NewsRecord) {
  const [year, month, day] = item.publishDate.split("-").map(Number);
  const [hours, minutes] = item.publishTime.split(":").map(Number);
  const publishAt = new Date(year, month - 1, day, hours, minutes);
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
          className="inline-flex h-[40px] shrink-0 items-center gap-2 rounded cursor-pointer border border-black bg-black px-4 text-[14px] uppercase text-white transition hover:bg-white hover:text-black"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3 w-3">
            <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Add News
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="border-b border-black text-[14px] font-bold uppercase">
              <th scope="col" className="px-2 py-3">News Title</th>
              <th scope="col" className="px-2 py-3">Publish Date</th>
              <th scope="col" className="px-2 py-3">Publish Time</th>
              <th scope="col" className="px-2 py-3">Author</th>
              <th scope="col" className="px-2 py-3">Status</th>
              <th scope="col" className="px-2 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className="border-b border-black text-[16px]">
                  <td className="max-w-[260px] truncate px-2 py-5" title={item.title}>{item.title}</td>
                  <td className="whitespace-nowrap px-2 py-5">{formatDate(item.publishDate)}</td>
                  <td className="whitespace-nowrap px-2 py-5">{formatTime(item.publishTime)}</td>
                  <td className="max-w-[160px] truncate px-2 py-5" title={item.author}>{item.author}</td>
                  <td className="px-2 py-5">
                    <span className="inline-flex items-center gap-2 font-bold uppercase text-[#22ad51]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#22ad51]" aria-hidden="true" />
                      {status}
                    </span>
                  </td>
                  <td className="relative px-2 py-4 text-center">
                    <button
                      type="button"
                      aria-label={`Actions for ${item.title}`}
                      aria-expanded={openMenuId === item.id}
                      onClick={() => setOpenMenuId((current) => current === item.id ? null : item.id)}
                      className="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.04] text-[16px] leading-none hover:bg-black/10"
                    >
                      ⋮
                    </button>
                    {openMenuId === item.id ? (
                      <div className="absolute right-5 top-12 z-10 min-w-[112px] border border-black/20 bg-white p-1 text-left shadow-md">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
