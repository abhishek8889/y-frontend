"use client";

import {
  customerOrderAmount,
  customerOrderEventNames,
  customerOrderProductLines,
  type CustomerOverviewActivity,
  type CustomerOverviewData,
  type CustomerOverviewUpcomingEvent,
  type CustomerOrder,
} from "@/apis/organisation/customersApi";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { useOrganisationTimezone } from "@/lib/organisation/useOrganisationTimezone";

type OverviewTabProps = {
  overview: CustomerOverviewData | null | undefined;
  isLoading?: boolean;
  onOpenTab?: (tab: string) => void;
};

function activityDetails(item: CustomerOverviewActivity): string {
  if (item.type === "refund" && item.refund) {
    const amount = item.refund.amount?.trim();
    const orderId = item.refund.order_unique_id?.trim();
    const parts = [
      item.description?.trim() || item.refund.unique_id?.trim(),
      amount ? `£${amount}` : null,
      orderId ? `Order #${orderId}` : null,
    ].filter(Boolean);
    return parts.join(" · ") || "—";
  }

  if (item.type === "order" && item.order) {
    const amount = item.order.total_amount?.trim();
    return [
      item.description?.trim() || item.order.unique_id?.trim(),
      amount ? `£${amount}` : null,
      item.order.status?.trim(),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return item.description?.trim() || "—";
}

function formatEventDate(
  event: CustomerOverviewUpcomingEvent,
  organisationTimezone: string,
) {
  return formatDateTime(event.starts_at, {
    includeYear: true,
    emptyLabel: "—",
    timeZone: event.timezone || organisationTimezone,
  });
}

export default function OverviewTab({
  overview,
  isLoading,
  onOpenTab,
}: OverviewTabProps) {
  const organisationTimezone = useOrganisationTimezone();

  function formatWhen(value: string | null | undefined) {
    return formatDateTime(value, {
      withAt: true,
      includeYear: true,
      emptyLabel: "—",
      timeZone: organisationTimezone,
    });
  }

  const recentActivity = overview?.recent_activity ?? [];
  const recentOrders = overview?.recent_orders ?? [];
  const upcomingEvents = overview?.upcoming_events ?? [];

  if (isLoading && !overview) {
    return (
      <div className="customer-overview" role="tabpanel" aria-label="Overview">
        <p className="customer-panel-empty">Loading overview…</p>
      </div>
    );
  }

  return (
    <div className="customer-overview" role="tabpanel" aria-label="Overview">
      <section className="customer-panel" aria-label="Recent activity">
        <div className="customer-panel-header">
          <h2 className="customer-panel-title">Recent activity</h2>
          <button
            type="button"
            className="customer-panel-link"
            onClick={() => onOpenTab?.("Activity")}
          >
            View all →
          </button>
        </div>

        {recentActivity.length ? (
          <ul className="customer-overview-list">
            {recentActivity.map((item, index) => (
              <li
                key={`${item.type}-${item.occurred_at}-${index}`}
                className="customer-overview-list-item"
              >
                <div className="customer-overview-list-main">
                  <p className="customer-overview-list-title">
                    {item.title?.trim() || "Activity"}
                  </p>
                  <p className="customer-overview-list-meta">
                    {activityDetails(item)}
                  </p>
                </div>
                <p className="customer-overview-list-side">
                  {formatWhen(item.occurred_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="customer-panel-empty">No recent activity.</p>
        )}
      </section>

      <div className="customer-events-grid">
        <section className="customer-panel" aria-label="Recent order">
          <div className="customer-panel-header">
            <h2 className="customer-panel-title">Recent order</h2>
            <button
              type="button"
              className="customer-panel-link"
              onClick={() => onOpenTab?.("Orders")}
            >
              View all →
            </button>
          </div>

          {recentOrders.length ? (
            <ul className="customer-overview-list">
              {recentOrders.map((order: CustomerOrder) => {
                const products = customerOrderProductLines(order);
                return (
                  <li
                    key={order.id}
                    className="customer-overview-list-item"
                  >
                    <div className="customer-overview-list-main">
                      <p className="customer-overview-list-title">
                        #{order.unique_id}
                      </p>
                      <p className="customer-overview-list-meta">
                        {[
                          customerOrderEventNames(order),
                          products[0],
                          products.length > 1
                            ? `+${products.length - 1}`
                            : null,
                          customerOrderAmount(order),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <p className="customer-overview-list-side">
                      {formatWhen(order.paid_at || order.created_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="customer-panel-empty">No recent orders.</p>
          )}
        </section>

        <section className="customer-panel" aria-label="Upcoming event">
          <div className="customer-panel-header">
            <h2 className="customer-panel-title">Upcoming event</h2>
            <button
              type="button"
              className="customer-panel-link"
              onClick={() => onOpenTab?.("Products")}
            >
              View all tickets →
            </button>
          </div>

          {upcomingEvents.length ? (
            <ul className="customer-overview-list">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="customer-overview-list-item">
                  <div className="customer-overview-list-main">
                    <p className="customer-overview-list-title">
                      {event.name?.trim() || "—"}
                    </p>
                    <p className="customer-overview-list-meta">
                      {event.venue?.name?.trim() || "—"}
                    </p>
                  </div>
                  <p className="customer-overview-list-side">
                    {formatEventDate(event, organisationTimezone)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="customer-panel-empty">No upcoming events.</p>
          )}
        </section>
      </div>
    </div>
  );
}
