"use client";

import { useState } from "react";
import NewsEmptyState from "./news/NewsEmptyState";
import NewsForm from "./news/NewsForm";
import NewsList from "./news/NewsList";
import type { NewsRecord } from "./news/types";

export default function NewsTab() {
  const [news, setNews] = useState<NewsRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRecord | null>(null);

  function openCreateForm() {
    setEditingNews(null);
    setIsFormOpen(true);
  }

  function openEditForm(item: NewsRecord) {
    setEditingNews(item);
    setIsFormOpen(true);
  }

  function saveNews(item: NewsRecord) {
    setNews((current) => {
      const existingIndex = current.findIndex((newsItem) => newsItem.id === item.id);
      if (existingIndex < 0) return [item, ...current];
      return current.map((newsItem) => (newsItem.id === item.id ? item : newsItem));
    });
    setIsFormOpen(false);
    setEditingNews(null);
  }

  function deleteNews(id: string) {
    setNews((current) => current.filter((item) => item.id !== id));
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingNews(null);
  }

  if (isFormOpen) {
    return <NewsForm initialNews={editingNews} onSave={saveNews} onCancel={closeForm} />;
  }

  if (news.length === 0) {
    return <NewsEmptyState onAddNews={openCreateForm} />;
  }

  return <NewsList news={news} onAddNews={openCreateForm} onEditNews={openEditForm} onDeleteNews={deleteNews} />;
}
