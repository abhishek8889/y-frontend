"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SITE_SUPPORT_CONTACT_PAGE_SIZE,
  useDeleteOrganisationSiteSupportContactMutation,
  useGetOrganisationSiteSupportContactListQuery,
  useLazyGetOrganisationSiteSupportContactListQuery,
  type SiteSupportContactItem,
} from "@/apis/organisation/siteSupportContactApi";
import { isApiSiteId } from "@/apis/organisation/siteApi";
import {
  ActionMenu,
  type ActionMenuItem,
} from "@/components/common";
import { SupportContactDrawer } from "./SupportContactDrawer";

type SupportContactsPanelProps = {
  siteId: string;
};

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M9.5 7V5.8c0-.7.5-1.3 1.2-1.3h2.6c.7 0 1.2.6 1.2 1.3V7M18 7v11.2c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8V7M10 11v5.5M14 11v5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SupportContactsPanel({ siteId }: SupportContactsPanelProps) {
  const canQuery = isApiSiteId(siteId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContact, setDrawerContact] =
    useState<SiteSupportContactItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [extraItems, setExtraItems] = useState<SiteSupportContactItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreLock = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const listArgs = useMemo(
    () =>
      canQuery
        ? { site_id: siteId, per_page: SITE_SUPPORT_CONTACT_PAGE_SIZE }
        : undefined,
    [canQuery, siteId],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOrganisationSiteSupportContactListQuery(listArgs, {
      skip: !canQuery,
    });

  const [fetchMore, { isFetching: isFetchingMore }] =
    useLazyGetOrganisationSiteSupportContactListQuery();
  const [deleteContact] = useDeleteOrganisationSiteSupportContactMutation();

  useEffect(() => {
    setExtraItems([]);
    loadMoreLock.current = false;
    const pagination = data?.data?.pagination;
    setNextCursor(pagination?.next_cursor ?? null);
    setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
  }, [data, siteId]);

  const items = useMemo(() => {
    const first = data?.data?.items ?? [];
    const seen = new Set<string>();
    const merged: SiteSupportContactItem[] = [];
    for (const item of [...first, ...extraItems]) {
      const key = String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    return merged;
  }, [data?.data?.items, extraItems]);

  const loadMore = useCallback(async () => {
    if (!canQuery || !nextCursor || !hasMore) return;
    if (isFetchingMore || isFetching || loadMoreLock.current) return;

    loadMoreLock.current = true;
    try {
      const result = await fetchMore({
        site_id: siteId,
        per_page: SITE_SUPPORT_CONTACT_PAGE_SIZE,
        cursor: nextCursor,
      }).unwrap();

      const pageItems = result.data?.items ?? [];
      const pagination = result.data?.pagination;
      if (pageItems.length) {
        setExtraItems((prev) => [...prev, ...pageItems]);
      }
      setNextCursor(pagination?.next_cursor ?? null);
      setHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
    } catch {
      // Keep current list; scroll again to retry.
    } finally {
      loadMoreLock.current = false;
    }
  }, [
    canQuery,
    nextCursor,
    hasMore,
    isFetchingMore,
    isFetching,
    fetchMore,
    siteId,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "240px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, items.length]);

  function openCreate() {
    setOpenMenuId(null);
    setDrawerContact(null);
    setDrawerOpen(true);
  }

  function openEdit(contact: SiteSupportContactItem) {
    setOpenMenuId(null);
    setDrawerContact(contact);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerContact(null);
  }

  async function removeContact(contact: SiteSupportContactItem) {
    setOpenMenuId(null);
    try {
      await deleteContact(contact.id).unwrap();
      setExtraItems((prev) =>
        prev.filter((row) => String(row.id) !== String(contact.id)),
      );
    } catch {
      // Toast handled by mutation.
    }
  }

  function contactActions(): ActionMenuItem<SiteSupportContactItem>[] {
    return [
      {
        key: "edit",
        label: "Edit",
        icon: <EditIcon />,
        onClick: (row) => openEdit(row),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteIcon />,
        variant: "danger",
        onClick: (row) => {
          void removeContact(row);
        },
      },
    ];
  }

  const showList = canQuery && items.length > 0;
  const showEmpty =
    canQuery && !isLoading && !isError && items.length === 0;

  return (
    <>
      <div className="csp-panel-head csp-panel-head--with-action">
        <h2 className="section-title">Support contacts</h2>
        {showList ? (
          <button
            type="button"
            className="page-primary-button-action"
            onClick={openCreate}
          >
            Add new
          </button>
        ) : null}
      </div>

      <div className="csp-panel-body">
        {!canQuery ? (
          <p className="csp-panel-lead">
            Support contacts are available after this microsite is saved on the
            server.
          </p>
        ) : null}

        {canQuery && isLoading ? (
          <p className="csp-panel-lead">Loading support contacts…</p>
        ) : null}

        {canQuery && isError ? (
          <div className="csp-empty">
            <p>Couldn’t load support contacts.</p>
            <button
              type="button"
              className="page-primary-button-action"
              onClick={() => {
                void refetch();
              }}
            >
              Try again
            </button>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="csp-empty csp-support-empty">
            <p>No support contacts yet.</p>
            <button
              type="button"
              className="page-primary-button-action"
              onClick={openCreate}
            >
              Add new
            </button>
          </div>
        ) : null}

        {showList ? (
          <>
            <div className="csp-support-grid">
              {items.map((contact) => {
                const menuId = `contact:${contact.id}`;
                const menuOpen = openMenuId === menuId;
                const initial = (
                  contact.department_name.trim().charAt(0) || "?"
                ).toUpperCase();
                const isInactive = contact.status === "inactive";
                return (
                  <article
                    key={String(contact.id)}
                    className={[
                      "csp-support-card",
                      menuOpen ? "is-menu-open" : "",
                      isInactive ? "is-inactive" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="csp-support-card-actions">
                      <ActionMenu
                        row={contact}
                        actions={contactActions()}
                        open={menuOpen}
                        onOpenChange={(open) =>
                          setOpenMenuId(open ? menuId : null)
                        }
                        align="right"
                        ariaLabel={`Actions for ${contact.department_name || "contact"}`}
                      />
                    </div>

                    <button
                      type="button"
                      className="csp-support-card-body"
                      onClick={() => openEdit(contact)}
                    >
                      <div className="csp-support-card-main">
                        <span className="csp-support-card-icon" aria-hidden="true">
                          {initial}
                        </span>
                        <div className="csp-support-card-identity">
                          <p className="csp-support-card-kind">
                            {isInactive ? "Inactive" : "Support contact"}
                          </p>
                          <h3 className="csp-support-card-title">
                            {contact.department_name || "Untitled department"}
                          </h3>
                        </div>
                      </div>

                      <div className="csp-support-card-meta">
                        <div className="csp-support-card-meta-item">
                          <span className="csp-support-card-meta-label">Email</span>
                          <span className="csp-support-card-meta-value">
                            {contact.email || "—"}
                          </span>
                        </div>
                        <div className="csp-support-card-meta-item">
                          <span className="csp-support-card-meta-label">Phone</span>
                          <span className="csp-support-card-meta-value">
                            {contact.phone || "—"}
                          </span>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>

            <div
              ref={sentinelRef}
              className="csp-news-scroll-sentinel"
              aria-hidden
            />
            {isFetchingMore ? (
              <p className="csp-panel-lead csp-news-loading-more">
                Loading more…
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <SupportContactDrawer
        open={drawerOpen}
        siteId={siteId}
        contact={drawerContact}
        onClose={closeDrawer}
        onSaved={() => {
          setExtraItems([]);
          void refetch();
        }}
      />
    </>
  );
}
