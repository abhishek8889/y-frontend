"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SelectField } from "@/components/ui/SelectField";

type TicketOffer = {
  id: string;
  name: string;
  price: number;
  quantityCap: number;
  maxTicketsPerOrder: number;
  validPeriod: string;
  access: string;
  status: string;
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

type TicketDialog = { type: "ticket" } | { type: "offer"; ticketId: string };

const ticketDescription =
  "Simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's";

const initialTicketTypes: TicketType[] = [
  {
    id: "general-admission",
    name: "General Admission",
    description: ticketDescription,
    price: 25,
    quantityCap: 150,
    sold: 120,
    currency: "Dollar",
    badgeLabel: "Most Popular",
    entitlement: "",
    status: "Active",
    offers: [
      { id: "early-bird-one", name: "Early Bird", price: 20, quantityCap: 50, maxTicketsPerOrder: 6, validPeriod: "01 Sep 2026 - 10 Sep 2026", access: "Public", status: "Active" },
      { id: "early-bird-two", name: "Early Bird", price: 20, quantityCap: 50, maxTicketsPerOrder: 6, validPeriod: "01 Sep 2026 - 10 Sep 2026", access: "Public", status: "Active" },
    ],
  },
  {
    id: "vip",
    name: "VIP",
    description: ticketDescription,
    price: 75,
    quantityCap: 50,
    sold: 12,
    currency: "Dollar",
    badgeLabel: "Limited",
    entitlement: "",
    status: "Active",
    offers: [],
  },
  {
    id: "complimentary",
    name: "Complimentary",
    description: ticketDescription,
    price: 0,
    quantityCap: 25,
    sold: 0,
    currency: "Dollar",
    badgeLabel: "",
    entitlement: "",
    status: "Active",
    offers: [],
  },
];

function TicketDialogFrame({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
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
        className="flex max-h-[calc(100dvh-16px)] h-[min(716px,calc(100dvh-16px))] w-full max-w-[480px] flex-col border border-[#333333] bg-white shadow-xl"
      >
        <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-black/70 px-[14px]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-8 w-8 shrink-0 bg-black" aria-hidden="true" />
            <div className="min-w-0">
              <h3 id="ticket-dialog-title" className="truncate text-[14px] font-black uppercase leading-[18px] text-black">
                {title}
              </h3>
              <p className="text-[11px] leading-[15px] text-[#737373]">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center text-[18px] leading-none text-black hover:text-black/60"
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function CreateTicketDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <TicketDialogFrame title="Create ticket" subtitle="Create ticket for event" onClose={onClose}>
      <form onSubmit={onCreate} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-[14px] overflow-y-auto px-[14px] py-3">
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Ticket name
            <InputField name="ticketName" required placeholder="e.g. Adult Standing 2025/26" density="compact" containerClassName="mt-1 !h-[29px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px] normal-case" />
          </label>
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Description
            <InputField as="textarea" name="ticketDescription" rows={4} placeholder="Type here..." containerClassName="mt-1 !h-[86px] !min-h-0 !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!min-h-0 !resize-none !px-2 !py-2 !text-[11px] normal-case" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
              Base price
              <span className="relative mt-1 block">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#777777]">$</span>
                <InputField name="ticketPrice" type="number" min="0" step="0.01" defaultValue="0" density="compact" prefix="$" prefixClassName="ml-2 mr-0 text-[11px] text-[#777777]" containerClassName="!h-[29px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px]" />
              </span>
            </label>
            <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
              Quantity cap
              <InputField name="quantityCap" type="number" min="1" defaultValue="500" required density="compact" containerClassName="mt-1 !h-[29px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px]" />
            </label>
          </div>
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Currency
            <SelectField name="ticketCurrency" defaultValue="Dollar" options={[{ value: "Dollar", label: "Dollar" }, { value: "Pound", label: "Pound" }, { value: "Euro", label: "Euro" }]} density="compact" containerClassName="mt-1 !h-[30px]" className="!rounded-[3px] !border-[#777777] !px-2 !text-[11px] !font-normal normal-case" />
          </label>
          <RadioGroup name="badgeLabel" legend="Badge label" defaultValue="Most Popular" variant="pills" options={[{ value: "Most Popular", label: "Most Popular" }, { value: "Limited", label: "Limited" }]} />
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Entitlement
            <InputField name="entitlement" placeholder="Add entitlement" density="compact" containerClassName="mt-1 !h-[29px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px] normal-case" />
          </label>
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Status
            <SelectField name="ticketStatus" defaultValue="Active" options={[{ value: "Active", label: "Active" }, { value: "Draft", label: "Draft" }, { value: "Inactive", label: "Inactive" }]} density="compact" containerClassName="mt-1 !h-[30px]" className="!rounded-[3px] !border-[#777777] !px-2 !text-[11px] !font-normal normal-case" />
          </label>
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-black/70 px-[14px] py-4">
          <Button type="button" onClick={onClose} className="h-[31px] rounded-[3px] border border-black/70 bg-white px-3 text-[10px] font-normal uppercase text-black hover:bg-black/5">Cancel</Button>
          <Button type="submit" className="h-[31px] rounded-[3px] border border-black bg-black px-3 text-[10px] font-normal uppercase text-white hover:bg-black/80">Create product</Button>
        </footer>
      </form>
    </TicketDialogFrame>
  );
}

function CreateOfferDialog({
  ticket,
  onClose,
  onCreate,
}: {
  ticket: TicketType;
  onClose: () => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <TicketDialogFrame title="Create new offer" subtitle="Create new offer" onClose={onClose}>
      <form onSubmit={onCreate} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-[14px] overflow-y-auto px-[14px] py-3">
          <div className="bg-[#EEEEEE] px-4 py-3">
            <h4 className="text-[11px] font-bold uppercase leading-[15px] text-black">{ticket.name}</h4>
            <p className="mt-1 text-[11px] leading-[15px] text-[#777777]">Base Price : ${ticket.price.toFixed(2)}</p>
            <p className="mt-1 text-[11px] leading-[15px] text-[#777777]">Total Qty Available : {ticket.quantityCap}</p>
          </div>
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Offer name
            <InputField name="offerName" required placeholder="Early Birds" density="compact" containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px] normal-case" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
              Price
              <span className="relative mt-1 block">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#777777]">$</span>
                <InputField name="offerPrice" type="number" min="0" step="0.01" defaultValue="0" density="compact" prefix="$" prefixClassName="ml-2 mr-0 text-[11px] text-[#777777]" containerClassName="!h-[30px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px]" />
              </span>
            </label>
            <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
              Quantity cap
              <InputField name="offerQuantityCap" type="number" min="1" defaultValue="500" required density="compact" containerClassName="mt-1 !h-[30px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px]" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
              Sale start
              <InputField name="validFrom" type="datetime-local" density="compact" containerClassName="mt-1 !h-[31px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-1.5 !text-[10px]" />
            </label>
            <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
              Sale end
              <InputField name="validTo" type="datetime-local" density="compact" containerClassName="mt-1 !h-[31px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-1.5 !text-[10px]" />
            </label>
          </div>
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Max tickets per order
            <InputField name="maxTicketsPerOrder" type="number" min="1" defaultValue="6" density="compact" containerClassName="mt-1 !h-[31px] !rounded-[3px] !border-[#777777] focus-within:!ring-0" className="!px-2 !text-[11px]" />
          </label>
          <RadioGroup name="offerAccess" legend="Access" defaultValue="Public" options={[{ value: "Public", label: "Public" }, { value: "Members only", label: "Members only" }]} />
          <label className="block text-[10px] font-bold uppercase leading-[13px] text-black">
            Status
            <SelectField name="offerStatus" defaultValue="Active" options={[{ value: "Active", label: "Active" }, { value: "Draft", label: "Draft" }, { value: "Inactive", label: "Inactive" }]} density="compact" containerClassName="mt-1 !h-[31px]" className="!rounded-[3px] !border-[#777777] !px-2 !text-[11px] !font-normal normal-case" />
          </label>
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-black/70 px-[14px] py-4">
          <Button type="button" onClick={onClose} className="h-[31px] rounded-[3px] border border-black/70 bg-white px-3 text-[10px] font-normal uppercase text-black hover:bg-black/5">Cancel</Button>
          <Button type="submit" className="h-[31px] rounded-[3px] border border-black bg-black px-3 text-[10px] font-normal uppercase text-white hover:bg-black/80">Create offer</Button>
        </footer>
      </form>
    </TicketDialogFrame>
  );
}

export default function TicketsTab({ eventTitle }: { eventTitle: string }) {
  const [tickets, setTickets] = useState(initialTicketTypes);
  const [expandedTicketIds, setExpandedTicketIds] = useState<string[]>(["general-admission"]);
  const [dialog, setDialog] = useState<TicketDialog | null>(null);
  const [menuTicketId, setMenuTicketId] = useState<string | null>(null);
  const dialogTicket = dialog?.type === "offer" ? tickets.find((ticket) => ticket.id === dialog.ticketId) : null;

  function toggleTicket(ticketId: string) {
    setExpandedTicketIds((current) =>
      current.includes(ticketId) ? current.filter((id) => id !== ticketId) : [...current, ticketId],
    );
  }

  function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("ticketName") ?? "").trim();
    const quantityCap = Number(formData.get("quantityCap"));
    if (!name || quantityCap < 1) return;

    const ticket: TicketType = {
      id: crypto.randomUUID(),
      name,
      description: String(formData.get("ticketDescription") ?? "").trim(),
      price: Number(formData.get("ticketPrice")) || 0,
      quantityCap,
      sold: 0,
      currency: String(formData.get("ticketCurrency") ?? "Dollar"),
      badgeLabel: String(formData.get("badgeLabel") ?? ""),
      entitlement: String(formData.get("entitlement") ?? "").trim(),
      status: String(formData.get("ticketStatus") ?? "Active"),
      offers: [],
    };

    setTickets((current) => [...current, ticket]);
    setExpandedTicketIds((current) => [...current, ticket.id]);
    setDialog(null);
  }

  function createOffer(event: FormEvent<HTMLFormElement>, ticketId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("offerName") ?? "").trim();
    const quantityCap = Number(formData.get("offerQuantityCap"));
    if (!name || quantityCap < 1) return;

    const validFrom = String(formData.get("validFrom") ?? "");
    const validTo = String(formData.get("validTo") ?? "");
    const offer: TicketOffer = {
      id: crypto.randomUUID(),
      name,
      price: Number(formData.get("offerPrice")) || 0,
      quantityCap,
      maxTicketsPerOrder: Number(formData.get("maxTicketsPerOrder")) || 6,
      validPeriod: validFrom && validTo ? `${validFrom.replace("T", " ")} - ${validTo.replace("T", " ")}` : "Not set",
      access: String(formData.get("offerAccess") ?? "Public"),
      status: String(formData.get("offerStatus") ?? "Active"),
    };

    setTickets((current) => current.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, offers: [...ticket.offers, offer] } : ticket,
    ));
    setDialog(null);
  }

  return (
    <div className="pt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[22px] font-black uppercase leading-none tracking-[-0.03em] text-black">Tickets</h3>
        <Button type="button" onClick={() => setDialog({ type: "ticket" })} className="inline-flex h-[34px] items-center justify-center rounded-[3px] border border-black bg-black px-3 text-[11px] font-bold uppercase text-white hover:bg-white hover:text-black">
          + Create ticket
        </Button>
      </div>

      <div className="space-y-5">
        {tickets.map((ticket) => {
          const isExpanded = expandedTicketIds.includes(ticket.id);
          const remaining = Math.max(0, ticket.quantityCap - ticket.sold);

          return (
            <article key={ticket.id} className="border border-black/70 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="pt-0.5 text-[14px] font-bold uppercase text-black">{ticket.name}</h4>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase text-[#1DB954]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954]" />{ticket.status}
                  </span>
                  <div className="relative">
                    <button type="button" aria-label={`More actions for ${ticket.name}`} aria-expanded={menuTicketId === ticket.id} onClick={() => setMenuTicketId(menuTicketId === ticket.id ? null : ticket.id)} className="flex h-6 w-5 items-center justify-center text-[18px] leading-none text-black/70 hover:text-black">⋮</button>
                    {menuTicketId === ticket.id ? (
                      <button type="button" onClick={() => {
                        setTickets((current) => current.filter((item) => item.id !== ticket.id));
                        setMenuTicketId(null);
                      }} className="absolute right-0 top-7 z-10 whitespace-nowrap border border-black/20 bg-white px-3 py-2 text-[11px] font-bold uppercase text-black shadow-sm hover:bg-black hover:text-white">
                        Delete ticket
                      </button>
                    ) : null}
                  </div>
                  <button type="button" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${ticket.name}`} aria-expanded={isExpanded} onClick={() => toggleTicket(ticket.id)} className="flex h-6 w-5 items-center justify-center text-black/70 hover:text-black">
                    <svg className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="m1 6.5 5-5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <>
                  <p className="mb-4 mt-2 max-w-[1000px] text-[12px] leading-[17px] text-[#777777]">{ticket.description}</p>
                  <dl className="grid grid-cols-2 border border-black/70 md:grid-cols-4">
                    {[
                      { label: "Price", value: `${ticket.currency === "Pound" ? "£" : ticket.currency === "Euro" ? "€" : "$"}${ticket.price.toFixed(2)}` },
                      { label: "Quantity cap", value: String(ticket.quantityCap) },
                      { label: "Sold", value: String(ticket.sold) },
                      { label: "Remaining", value: String(remaining) },
                    ].map((metric, index) => (
                      <div key={metric.label} className={`min-h-[62px] px-4 py-2.5 ${index < 2 ? "border-b md:border-b-0" : ""} ${index % 2 === 0 ? "border-r" : ""} border-black/70 ${index === 1 ? "md:border-r" : ""}`}>
                        <dd className="text-[13px] font-bold text-black">{metric.value}</dd>
                        <dt className="mt-1 text-[11px] text-[#888888]">{metric.label}</dt>
                      </div>
                    ))}
                  </dl>
                  <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <p className="flex items-center gap-2 text-[12px] font-bold text-black">
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M11.4 2.1 18 8.7l-8.7 8.7H2.7v-6.6l8.7-8.7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="6.1" cy="13.2" r="1" fill="currentColor" /></svg>
                      Offers: {ticket.offers.length}
                    </p>
                    <Button type="button" onClick={() => setDialog({ type: "offer", ticketId: ticket.id })} className="h-[32px] rounded-[3px] border border-black/70 bg-white px-3 text-[10px] font-bold uppercase text-black hover:bg-black hover:text-white">+ Create offer</Button>
                  </div>
                  {ticket.offers.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead><tr className="bg-[#EEEEEE] text-[10px] font-bold uppercase text-black">
                          <th className="border-y border-black/35 px-2.5 py-3">Offer name</th><th className="border-y border-black/35 px-2.5 py-3">Price</th><th className="border-y border-black/35 px-2.5 py-3">Quantity cap</th><th className="border-y border-black/35 px-2.5 py-3">Valid period</th><th className="border-y border-black/35 px-2.5 py-3">Access</th><th className="border-y border-black/35 px-2.5 py-3">Status</th><th className="border-y border-black/35 px-2.5 py-3 text-center">Action</th>
                        </tr></thead>
                        <tbody>{ticket.offers.map((offer) => (
                          <tr key={offer.id} className="text-[12px] text-black">
                            <td className="border-b border-black/50 px-2.5 py-3.5">{offer.name}</td>
                            <td className="border-b border-black/50 px-2.5 py-3.5">${offer.price.toFixed(2)}</td>
                            <td className="border-b border-black/50 px-2.5 py-3.5">{offer.quantityCap}</td>
                            <td className="border-b border-black/50 px-2.5 py-3.5">{offer.validPeriod}</td>
                            <td className="border-b border-black/50 px-2.5 py-3.5">{offer.access}</td>
                            <td className="border-b border-black/50 px-2.5 py-3.5"><span className="inline-flex items-center gap-1.5 font-bold uppercase text-[#1DB954]"><span className="h-1.5 w-1.5 rounded-full bg-[#1DB954]" />{offer.status}</span></td>
                            <td className="border-b border-black/50 px-2.5 py-3 text-center"><button type="button" aria-label={`Delete ${offer.name} offer`} onClick={() => setTickets((current) => current.map((item) => item.id === ticket.id ? { ...item, offers: item.offers.filter((itemOffer) => itemOffer.id !== offer.id) } : item))} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[16px] text-black/65 hover:bg-black/10">×</button></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ) : <p className="border-t border-black/15 py-4 text-[12px] text-black/50">No offers for this ticket yet.</p>}
                </>
              ) : <p className="mt-2 truncate text-[12px] text-[#777777]">{ticket.description}</p>}
            </article>
          );
        })}
        {tickets.length === 0 ? <p className="border border-dashed border-black/30 px-4 py-10 text-center text-[13px] text-black/55">No tickets created for {eventTitle} yet.</p> : null}
      </div>

      {dialog?.type === "ticket" ? <CreateTicketDialog onClose={() => setDialog(null)} onCreate={createTicket} /> : null}
      {dialog?.type === "offer" && dialogTicket ? <CreateOfferDialog ticket={dialogTicket} onClose={() => setDialog(null)} onCreate={(event) => createOffer(event, dialog.ticketId)} /> : null}
    </div>
  );
}