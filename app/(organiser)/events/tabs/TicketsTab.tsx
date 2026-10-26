"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  normalizeEventTickets,
  useCreateEventTicketMutation,
  useCreateEventTicketOfferMutation,
  useDeleteEventTicketMutation,
  useDeleteEventTicketOfferMutation,
  useGetEventTicketsQuery,
  useUpdateEventTicketMutation,
  useUpdateEventTicketOfferMutation,
  type EventTicket,
  type EventTicketStatus,
} from "@/apis/events/eventsApi";
import {
  ActionMenu,
  StatusBadge,
  WarningAlertIcon,
  YourlistAlert,
  type ActionMenuItem,
} from "@/components/common";
import {
  localDateTimeInZoneToUtcSql,
  utcSqlToLocalDateTimeInZone,
} from "@/components/organiser/events/eventFormHelpers";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SelectField } from "@/components/ui/SelectField";
import { appToast } from "@/lib/ui/toast";

const PencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M13 6.5 17.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7h16M9 7V5h6v2m-7 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type TicketOffer = {
  id: string;
  name: string;
  price: number;
  quantityCap: number;
  maxTicketsPerOrder: number;
  validPeriod: string;
  saleStartsAt: string;
  saleEndsAt: string;
  access: string;
  status: string;
  sortOrder: number;
};

type TicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantityCap: number;
  sold: number;
  currency: string;
  badgeLabel: string;
  entitlement: string;
  status: string;
  offers: TicketOffer[];
};

type TicketDialog =
  | { type: "ticket"; ticket?: TicketType }
  | { type: "offer"; ticketId: string; offer?: TicketOffer };

type DeleteConfirmState =
  | { type: "ticket"; ticket: TicketType }
  | { type: "offer"; offer: TicketOffer };

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "EUR", label: "EUR" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Inactive" },
  { value: "sold_out", label: "Sold out" },
];

function toApiCurrency(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "DOLLAR" || normalized === "USD" || normalized === "$") return "USD";
  if (normalized === "POUND" || normalized === "GBP" || normalized === "£") return "GBP";
  if (normalized === "EURO" || normalized === "EUR" || normalized === "€") return "EUR";
  return normalized || "USD";
}

function toApiStatus(value: string): EventTicketStatus {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "draft") return "draft";
  if (normalized === "inactive") return "inactive";
  if (normalized === "sold_out" || normalized === "soldout") return "sold_out";
  return "active";
}

function currencySymbol(currency: string) {
  const code = toApiCurrency(currency);
  if (code === "GBP") return "£";
  if (code === "EUR") return "€";
  return "$";
}

function formatUtcInEventZone(utcValue: string | null | undefined, timeZone: string) {
  if (!utcValue?.trim()) return "";
  const local = utcSqlToLocalDateTimeInZone(utcValue, timeZone);
  return local ? local.replace("T", " ") : utcValue.trim();
}

function formatOfferPeriod(
  from: string | null | undefined,
  to: string | null | undefined,
  timeZone: string,
) {
  const start = formatUtcInEventZone(from, timeZone);
  const end = formatUtcInEventZone(to, timeZone);
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return "Not set";
}

function toApiAccess(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "members_only" || normalized === "members") return "members_only";
  return "public";
}

function mapApiTicket(ticket: EventTicket, timeZone: string): TicketType {
  return {
    id: String(ticket.id),
    name: ticket.name,
    description: ticket.description ?? "",
    price: Number(ticket.base_price ?? ticket.price ?? 0),
    quantityCap: Number(ticket.quantity_cap ?? ticket.quantity ?? 0),
    sold: Number(ticket.sold ?? 0),
    currency: toApiCurrency(ticket.currency ?? "USD"),
    badgeLabel: ticket.badge_label ?? "",
    entitlement: ticket.entitlement ?? "",
    status: toApiStatus(ticket.status ?? "active"),
    offers: (ticket.offers ?? []).map((offer, index) => ({
      id: String(offer.id),
      name: offer.name,
      price: Number(offer.price ?? 0),
      quantityCap: Number(offer.quantity_cap ?? 0),
      maxTicketsPerOrder: Number(offer.max_per_order ?? offer.max_tickets_per_order ?? 6),
      validPeriod: formatOfferPeriod(
        offer.sale_starts_at ?? offer.valid_from,
        offer.sale_ends_at ?? offer.valid_to,
        timeZone,
      ),
      saleStartsAt: offer.sale_starts_at ?? offer.valid_from ?? "",
      saleEndsAt: offer.sale_ends_at ?? offer.valid_to ?? "",
      access: offer.access ?? "public",
      status: offer.status ?? "active",
      sortOrder: Number(offer.sort_order ?? index),
    })),
  };
}

function TicketDialogFrame({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-dialog-title"
        className="flex max-h-[calc(100dvh-24px)] h-[min(680px,calc(100dvh-24px))] w-full max-w-[560px] flex-col overflow-hidden rounded-[4px] border border-black bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] bg-black text-white"
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 8h16v10H4V8Zm3-4h10v3H7V4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <h3
                id="ticket-dialog-title"
                className="font-heading truncate text-[18px] font-bold uppercase leading-[26px] text-black"
              >
                {title}
              </h3>
              <p className="mt-1 text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-3 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[24px] leading-none text-black transition hover:bg-black/5"
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

function TicketFormDialog({
  ticket,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  ticket?: TicketType;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isEdit = Boolean(ticket);

  return (
    <TicketDialogFrame
      title={isEdit ? "Edit ticket" : "Create ticket"}
      subtitle={isEdit ? "Update ticket for event" : "Create ticket for event"}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-[14px] overflow-y-auto px-5 py-[14px]">
          <InputField
            label="Ticket name"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="ticketName"
            required
            defaultValue={ticket?.name}
            placeholder="e.g. Adult Standing 2025/26"
            density="compact"
            containerClassName="mb-[20px]"
          />
          <InputField
            label="Description"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            as="textarea"
            name="ticketDescription"
            rows={4}
            defaultValue={ticket?.description}
            placeholder="Type here..."
            containerClassName="mt-1 !h-[86px] !min-h-0 !rounded-[3px] mb-[20px] focus-within:!ring-0"
          />
          <div className="mb-[20px] grid grid-cols-2 gap-2">
            <InputField
              name="ticketPrice"
              type="number"
              min="0"
              label="Base price"
              labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
              step="0.01"
              defaultValue={String(ticket?.price ?? 0)}
              density="compact"
              prefix="$"
              className="!pl-0"
            />
            <InputField
              name="quantityCap"
              label="Quantity cap"
              labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
              type="number"
              min="1"
              defaultValue={String(ticket?.quantityCap ?? 500)}
              required
              density="compact"
            />
          </div>
          <SelectField
            name="ticketCurrency"
            defaultValue={toApiCurrency(ticket?.currency ?? "USD")}
            label="Currency"
            wrapperClassName="mb-[20px]"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            options={currencyOptions}
            density="compact"
          />
          <InputField
            label="Badge label"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="badgeLabel"
            defaultValue={ticket?.badgeLabel ?? ""}
            placeholder="e.g. Most Popular"
            density="compact"
            containerClassName="mb-[20px]"
          />
          <InputField
            label="Entitlement"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="entitlement"
            defaultValue={ticket?.entitlement}
            placeholder="Add entitlement"
            density="compact"
            containerClassName="mb-[20px]"
          />
          <SelectField
            label="Status"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="ticketStatus"
            defaultValue={toApiStatus(ticket?.status ?? "active")}
            wrapperClassName="mb-[50px]"
            options={statusOptions}
            density="compact"
          />
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-black/70 px-[14px] py-4">
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-[40px] cursor-pointer rounded-[3px] border border-black/70 bg-white px-3 text-[14px] font-normal uppercase text-black hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[40px] cursor-pointer rounded-[3px] border border-black bg-black px-3 text-[14px] font-normal uppercase text-white hover:bg-black/80 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create ticket"}
          </Button>
        </footer>
      </form>
    </TicketDialogFrame>
  );
}

function CreateOfferDialog({
  ticket,
  offer,
  timeZone,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  ticket: TicketType;
  offer?: TicketOffer;
  timeZone: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isEditing = Boolean(offer);
  const saleStartDefault = offer?.saleStartsAt
    ? utcSqlToLocalDateTimeInZone(offer.saleStartsAt, timeZone)
    : "";
  const saleEndDefault = offer?.saleEndsAt
    ? utcSqlToLocalDateTimeInZone(offer.saleEndsAt, timeZone)
    : "";

  return (
    <TicketDialogFrame
      title={isEditing ? "Edit offer" : "Create new offer"}
      subtitle={isEditing ? "Update offer details" : "Create new offer"}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-[14px] overflow-y-auto px-5 py-[14px]">
          <div className="bg-[#ECECEC] py-4 px-5">
            <h4 className="text-[14px] font-bold uppercase leading-[15px] text-black">{ticket.name}</h4>
            <p className="my-[4px] text-[14px] leading-[15px] text-[#6E6B69]">Base Price : ${ticket.price.toFixed(2)}</p>
            <p className="my-[4px] text-[14px] leading-[15px] text-[#6E6B69]">Total Qty Available : {ticket.quantityCap}</p>
          </div>
          <InputField
            name="offerName"
            label="Offer name"
            labelClassName="!text-[14px] !leading-[20px]"
            required
            placeholder="Early Birds"
            defaultValue={offer?.name ?? ""}
            density="compact"
            containerClassName="mb-[20px]"
          />
          <div className="grid grid-cols-2 gap-2 ">
            <InputField
              name="offerPrice"
              label="Price"
              labelClassName="!text-[14px] !leading-[20px]"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(offer?.price ?? 0)}
              density="compact"
              prefix="$"
              prefixClassName="ml-2 mr-0 text-[14px] text-[#777777]"
              containerClassName="!h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
              className="!px-2 !text-[14px]"
            />
            <InputField
              name="offerQuantityCap"
              label="Quantity cap"
              labelClassName="!text-[14px] !leading-[20px]"
              type="number"
              min="1"
              defaultValue={String(offer?.quantityCap ?? 500)}
              required
              density="compact"
              containerClassName="mt-1 !h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
              className="!px-2 !text-[14px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              name="validFrom"
              label="Sale start"
              labelClassName="!text-[14px] !leading-[20px]"
              type="datetime-local"
              required
              defaultValue={saleStartDefault}
              density="compact"
              containerClassName="mt-1 !h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
              className="!px-1.5 !text-[12px]"
            />
            <InputField
              name="validTo"
              label="Sale end"
              labelClassName="!text-[14px] !leading-[20px]"
              type="datetime-local"
              required
              defaultValue={saleEndDefault}
              density="compact"
              containerClassName="mt-1 !h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
              className="!px-1.5 !text-[12px]"
            />
          </div>
          <InputField
            name="maxTicketsPerOrder"
            label="Max tickets per order"
            labelClassName="!text-[14px] !leading-[20px]"
            type="number"
            min="1"
            defaultValue={String(offer?.maxTicketsPerOrder ?? 6)}
            density="compact"
            containerClassName="mt-1 !h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
            className="!px-2 !text-[14px]"
          />
          <RadioGroup
            name="offerAccess"
            legend="Access"
            labelClassName="!text-[14px] !leading-[20px]"
            optionClassName="!text-[14px]"
            defaultValue={toApiAccess(offer?.access ?? "public")}
            options={[
              { value: "public", label: "Public" },
              { value: "members_only", label: "Members only" },
            ]}
          />
          <SelectField
            name="offerStatus"
            label="Status"
            labelClassName="!text-[14px] !leading-[20px]"
            defaultValue={toApiStatus(offer?.status ?? "active")}
            options={statusOptions}
            density="compact"
            wrapperClassName="mb-[50px]"
            containerClassName="mt-1 !h-10"
            className="!rounded-[3px] !border-[#777777] !px-2 !text-[14px] !font-normal normal-case"
          />
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-black/70 px-[14px] py-4">
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-[40px] rounded-[3px] border border-black/70 bg-white px-3 text-[14px] font-normal uppercase text-black cursor-pointer hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[40px] rounded-[3px] border border-black bg-black px-3 text-[14px] font-normal uppercase text-white cursor-pointer hover:bg-black/80 disabled:opacity-50"
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create offer"}
          </Button>
        </footer>
      </form>
    </TicketDialogFrame>
  );
}

export default function TicketsTab({
  eventId,
  eventTitle,
  eventTimezone,
}: {
  eventId: number | string;
  eventTitle: string;
  eventTimezone?: string | null;
}) {
  const numericEventId = Number(eventId);
  const { data, isLoading, isError } = useGetEventTicketsQuery(eventId);
  const [createTicketMutation, { isLoading: isCreatingTicket }] = useCreateEventTicketMutation();
  const [updateTicketMutation, { isLoading: isUpdatingTicket }] = useUpdateEventTicketMutation();
  const [deleteTicketMutation, { isLoading: isDeletingTicket }] = useDeleteEventTicketMutation();
  const [createOfferMutation, { isLoading: isCreatingOffer }] = useCreateEventTicketOfferMutation();
  const [updateOfferMutation, { isLoading: isUpdatingOffer }] = useUpdateEventTicketOfferMutation();
  const [deleteOfferMutation, { isLoading: isDeletingOfferMutation }] =
    useDeleteEventTicketOfferMutation();

  const timeZone =
    eventTimezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const tickets = useMemo(
    () => normalizeEventTickets(data?.data).map((ticket) => mapApiTicket(ticket, timeZone)),
    [data?.data, timeZone],
  );
  /** null = use default (first ticket expanded); avoids setState-during-mount from syncing tickets */
  const [expandedTicketIds, setExpandedTicketIds] = useState<string[] | null>(null);
  const [dialog, setDialog] = useState<TicketDialog | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [isDeletingOffer, setIsDeletingOffer] = useState(false);

  useEffect(() => {
    setExpandedTicketIds(null);
    setDialog(null);
    setOpenActionId(null);
    setDeleteConfirm(null);
    setDeletingTicketId(null);
    setIsDeletingOffer(false);
  }, [eventId]);

  const resolvedExpandedTicketIds =
    expandedTicketIds ?? (tickets[0] ? [tickets[0].id] : []);
  const dialogTicket =
    dialog?.type === "offer" ? tickets.find((ticket) => ticket.id === dialog.ticketId) : null;
  const editingTicket = dialog?.type === "ticket" ? dialog.ticket : undefined;
  const editingOffer = dialog?.type === "offer" ? dialog.offer : undefined;
  const isSavingTicket = isCreatingTicket || isUpdatingTicket;
  const isSavingOffer = isCreatingOffer || isUpdatingOffer;

  function toggleTicket(ticketId: string) {
    setExpandedTicketIds((current) => {
      const base = current ?? (tickets[0] ? [tickets[0].id] : []);
      return base.includes(ticketId) ? base.filter((id) => id !== ticketId) : [...base, ticketId];
    });
  }

  async function saveTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isFinite(numericEventId)) {
      appToast.error("Missing event id.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("ticketName") ?? "").trim();
    const quantityCap = Number(formData.get("quantityCap"));
    if (!name || quantityCap < 1) {
      appToast.error("Ticket name and quantity cap are required.");
      return;
    }

    const payload = {
      event_id: numericEventId,
      name,
      description: String(formData.get("ticketDescription") ?? "").trim() || null,
      base_price: Number(formData.get("ticketPrice")) || 0,
      currency: toApiCurrency(String(formData.get("ticketCurrency") ?? "USD")),
      quantity_cap: quantityCap,
      badge_label: String(formData.get("badgeLabel") ?? "").trim() || null,
      entitlement: String(formData.get("entitlement") ?? "").trim() || null,
      sort_order: editingTicket ? tickets.findIndex((ticket) => ticket.id === editingTicket.id) : tickets.length,
      status: toApiStatus(String(formData.get("ticketStatus") ?? "active")),
    };

    try {
      if (editingTicket) {
        await updateTicketMutation({ ticketId: editingTicket.id, body: payload }).unwrap();
      } else {
        const result = await createTicketMutation(payload).unwrap();
        const createdId = String(result.data.id);
        setExpandedTicketIds((current) => {
          const base = current ?? (tickets[0] ? [tickets[0].id] : []);
          return base.includes(createdId) ? base : [...base, createdId];
        });
      }
      setDialog(null);
    } catch {
      // toast handled by mutation
    }
  }

  function openDeleteConfirm(state: DeleteConfirmState) {
    setOpenActionId(null);
    setDeleteConfirm(state);
  }

  function closeDeleteConfirm() {
    if (isDeletingTicket || isDeletingOffer || isDeletingOfferMutation) return;
    setDeleteConfirm(null);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "ticket") {
      setDeletingTicketId(deleteConfirm.ticket.id);
      try {
        await deleteTicketMutation({
          ticketId: deleteConfirm.ticket.id,
          eventId,
        }).unwrap();
        setDeleteConfirm(null);
      } catch {
        // toast handled by mutation
      } finally {
        setDeletingTicketId(null);
      }
      return;
    }

    setIsDeletingOffer(true);
    try {
      await deleteOfferMutation({
        offerId: deleteConfirm.offer.id,
        eventId,
      }).unwrap();
      setDeleteConfirm(null);
    } catch {
      // toast handled by mutation
    } finally {
      setIsDeletingOffer(false);
    }
  }

  const deleteConfirmCopy =
    deleteConfirm?.type === "ticket"
      ? {
          message: `Delete "${deleteConfirm.ticket.name}"? This action cannot be undone.`,
          primaryButtonLabel: "DELETE TICKET",
        }
      : deleteConfirm?.type === "offer"
        ? {
            message: `Delete "${deleteConfirm.offer.name}"? This action cannot be undone.`,
            primaryButtonLabel: "DELETE OFFER",
          }
        : null;

  const isDeleteSubmitting =
    Boolean(isDeletingTicket && deletingTicketId) ||
    isDeletingOffer ||
    isDeletingOfferMutation;

  function getTicketActions(ticket: TicketType): ActionMenuItem<TicketType>[] {
    return [
      {
        key: "edit",
        label: "Edit",
        icon: PencilIcon,
        onClick: (row) => setDialog({ type: "ticket", ticket: row }),
      },
      {
        key: "delete",
        label: "Delete",
        icon: TrashIcon,
        disabled: isDeletingTicket && deletingTicketId === ticket.id,
        onClick: (row) => openDeleteConfirm({ type: "ticket", ticket: row }),
      },
    ];
  }

  function getOfferActions(ticketId: string): ActionMenuItem<TicketOffer>[] {
    return [
      {
        key: "edit",
        label: "Edit",
        icon: PencilIcon,
        onClick: (offer) => {
          setOpenActionId(null);
          setDialog({ type: "offer", ticketId, offer });
        },
      },
      {
        key: "delete",
        label: "Delete",
        icon: TrashIcon,
        onClick: (offer) => openDeleteConfirm({ type: "offer", offer }),
      },
    ];
  }

  async function saveOffer(event: FormEvent<HTMLFormElement>, ticketId: string) {
    event.preventDefault();
    event.stopPropagation();

    const ticketNumericId = Number(ticketId);
    if (!Number.isFinite(ticketNumericId)) {
      appToast.error("Missing ticket id.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("offerName") ?? "").trim();
    const quantityCap = Number(formData.get("offerQuantityCap"));
    const saleStartLocal = String(formData.get("validFrom") ?? "").trim();
    const saleEndLocal = String(formData.get("validTo") ?? "").trim();

    if (!name || quantityCap < 1) {
      appToast.error("Offer name and quantity cap are required.");
      return;
    }
    if (!saleStartLocal || !saleEndLocal) {
      appToast.error("Sale start and sale end are required.");
      return;
    }

    let saleStartsAt = "";
    let saleEndsAt = "";
    try {
      saleStartsAt = localDateTimeInZoneToUtcSql(saleStartLocal, timeZone);
      saleEndsAt = localDateTimeInZoneToUtcSql(saleEndLocal, timeZone);
    } catch {
      appToast.error("Invalid sale start or sale end datetime.");
      return;
    }

    const ticket = tickets.find((item) => item.id === ticketId);
    const payload = {
      ticket_id: ticketNumericId,
      name,
      price: Number(formData.get("offerPrice")) || 0,
      quantity_cap: quantityCap,
      sale_starts_at: saleStartsAt,
      sale_ends_at: saleEndsAt,
      max_per_order: Number(formData.get("maxTicketsPerOrder")) || 6,
      access: toApiAccess(String(formData.get("offerAccess") ?? "public")),
      status: toApiStatus(String(formData.get("offerStatus") ?? "active")),
      sort_order: editingOffer?.sortOrder ?? ticket?.offers.length ?? 0,
    };

    try {
      if (editingOffer) {
        await updateOfferMutation({
          offerId: editingOffer.id,
          eventId,
          body: payload,
        }).unwrap();
      } else {
        await createOfferMutation({ eventId, body: payload }).unwrap();
        setExpandedTicketIds((current) => {
          const base = current ?? (tickets[0] ? [tickets[0].id] : []);
          return base.includes(ticketId) ? base : [...base, ticketId];
        });
      }
      setDialog(null);
    } catch {
      // toast handled by mutation
    }
  }

  return (
    <div className="pt-4">
      <div className="mb-[27px] flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-[22px] font-bold uppercase leading-none tracking-[-0.03em] text-black sm:text-[26px]">
          Products
        </h3>
        <Button
          type="button"
          onClick={() => setDialog({ type: "ticket" })}
          className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black px-3 text-[14px] font-bold uppercase leading-[20px] text-white hover:bg-white hover:text-black"
        >
          + Create ticket
        </Button>
      </div>

      {isLoading ? (
        <p className="border border-dashed border-black/30 px-4 py-10 text-center text-[13px] text-black/55">
          Loading tickets...
        </p>
      ) : null}

      {isError ? (
        <p className="border border-dashed border-[#d32f2f]/40 px-4 py-10 text-center text-[13px] text-[#d32f2f]">
          Unable to load tickets for this event.
        </p>
      ) : null}

      <div className="space-y-5">
        {!isLoading && !isError
          ? tickets.map((ticket) => {
          const isExpanded = resolvedExpandedTicketIds.includes(ticket.id);
          const remaining = Math.max(0, ticket.quantityCap - ticket.sold);

          return (
            <article key={ticket.id} className="border border-black/70 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-[18px] leading-[20px] font-bold uppercase text-black">{ticket.name}</h4>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={ticket.status} className="text-[16px] leading-[20px]" />
                  <ActionMenu
                    row={ticket}
                    actions={getTicketActions(ticket)}
                    open={openActionId === `ticket-${ticket.id}`}
                    onOpenChange={(nextOpen) =>
                      setOpenActionId(nextOpen ? `ticket-${ticket.id}` : null)
                    }
                    ariaLabel={`Open actions for ${ticket.name}`}
                  />
                  <button type="button" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${ticket.name}`} aria-expanded={isExpanded} onClick={() => toggleTicket(ticket.id)} className="flex h-6 w-5 items-center justify-center text-black/70 hover:text-black">
                    <svg className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="m1 6.5 5-5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <>
                  <p className="mt-4 mb-[22px] max-w-[1000px] text-[14px] leading-[20px] text-[#6F6E69]">{ticket.description}</p>
                  <dl className="grid grid-cols-2 border border-black/70 md:grid-cols-4">
                    {[
                      { label: "Price", value: `${currencySymbol(ticket.currency)}${ticket.price.toFixed(2)}` },
                      { label: "Quantity cap", value: String(ticket.quantityCap) },
                      { label: "Sold", value: String(ticket.sold) },
                      { label: "Remaining", value: String(remaining) },
                    ].map((metric, index) => (
                      <div key={metric.label} className={`min-h-[62px] py-4 px-8 ${index < 2 ? "border-b md:border-b-0" : ""} ${index % 2 === 0 ? "border-r" : ""} border-black/70 ${index === 1 ? "md:border-r" : ""}`}>
                        <dd className="text-[16px] leading-[20px] font-bold text-black">{metric.value}</dd>
                        <dt className="mt-1 text-[14px] leading-[20px] text-[#949494]">{metric.label}</dt>
                      </div>
                    ))}
                  </dl>
                  <div className="flex flex-wrap items-center justify-between gap-3 py-6">
                    <p className="flex items-center gap-2 text-[16px] font-bold text-black">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM13 20.01L4 11V4H11V3.99L20 12.99L13 20.01Z" fill="black"/>
                      <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z" fill="black"/>
                      </svg>
                      Offers: {ticket.offers.length}
                    </p>
                    <Button 
                      type="button" 
                      onClick={() => setDialog({ type: "offer", ticketId: ticket.id })} 
                      className="cursor-pointer h-[40px] rounded-[3px] border border-black/100 bg-white px-3 text-[14px] leading-[20px] font-bold uppercase text-black hover:bg-black hover:text-white">
                        + Create offer
                    </Button>
                  </div>
                  {ticket.offers.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead><tr className="bg-[#EEEEEE] text-[14px] font-bold uppercase text-black">
                          <th className="border-y border-black/35 py-[18px] px-3">Offer name</th>
                          <th className="border-y border-black/35 py-[18px] px-3">Price</th>
                          <th className="border-y border-black/35 py-[18px] px-3">Quantity cap</th>
                          <th className="border-y border-black/35 py-[18px] px-3">Valid period</th>
                          <th className="border-y border-black/35 py-[18px] px-3">Access</th>
                          <th className="border-y border-black/35 py-[18px] px-3">Status</th>
                          <th className="border-y border-black/35 py-[18px] px-3 text-center">Action</th>
                        </tr></thead>
                        <tbody>{ticket.offers.map((offer) => (
                          <tr key={offer.id} className="border-b border-black/50 text-[16px] leading-[20px] text-black last:border-b-0">
                            <td className="py-[18px] px-3">{offer.name}</td>
                            <td className="py-[18px] px-3">${offer.price.toFixed(2)}</td>
                            <td className="py-[18px] px-3">{offer.quantityCap}</td>
                            <td className="py-[18px] px-3">{offer.validPeriod}</td>
                            <td className="py-[18px] px-3">{offer.access}</td>
                            <td className="py-[18px] px-3">
                              <StatusBadge status={offer.status} />
                            </td>
                            <td className="px-2.5 py-3 text-center">
                              <ActionMenu
                                row={offer}
                                actions={getOfferActions(ticket.id)}
                                open={openActionId === `offer-${offer.id}`}
                                onOpenChange={(nextOpen) =>
                                  setOpenActionId(nextOpen ? `offer-${offer.id}` : null)
                                }
                                ariaLabel={`Open actions for ${offer.name}`}
                                className="justify-center"
                              />
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ) : <p className="border-t border-black/15 py-4 text-[12px] text-black/50">No offers for this ticket yet.</p>}
                </>
              ) : <p className="mt-[16px] truncate text-[14px] leading-[20px] text-[#6F6E69]">{ticket.description}</p>}
            </article>
          );
        })
          : null}
        {!isLoading && !isError && tickets.length === 0 ? (
          <p className="border border-dashed border-black/30 px-4 py-10 text-center text-[13px] text-black/55">
            No tickets created for {eventTitle} yet.
          </p>
        ) : null}
      </div>

      {dialog?.type === "ticket" ? (
        <TicketFormDialog
          key={editingTicket?.id ?? "create-ticket"}
          ticket={editingTicket}
          isSubmitting={isSavingTicket}
          onClose={() => setDialog(null)}
          onSubmit={(event) => {
            void saveTicket(event);
          }}
        />
      ) : null}
      {dialog?.type === "offer" && dialogTicket ? (
        <CreateOfferDialog
          key={editingOffer ? `offer-edit-${editingOffer.id}` : `offer-create-${dialog.ticketId}`}
          ticket={dialogTicket}
          offer={editingOffer}
          timeZone={timeZone}
          isSubmitting={isSavingOffer}
          onClose={() => setDialog(null)}
          onSubmit={(event) => {
            void saveOffer(event, dialog.ticketId);
          }}
        />
      ) : null}

      <YourlistAlert
        isOpen={Boolean(deleteConfirm)}
        onClose={closeDeleteConfirm}
        title="ARE YOU SURE?"
        message={deleteConfirmCopy?.message}
        icon={<WarningAlertIcon />}
        variant="warning"
        showFooter
        secondaryButtonLabel="CANCEL"
        onSecondaryClick={closeDeleteConfirm}
        primaryButtonLabel={deleteConfirmCopy?.primaryButtonLabel}
        onPrimaryClick={() => {
          void confirmDelete();
        }}
        isSubmitting={isDeleteSubmitting}
      />
    </div>
  );
}