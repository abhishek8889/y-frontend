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
        className="flex max-h-[calc(100dvh-16px)] h-[min(716px,calc(100dvh-16px))] w-full max-w-[640px] flex-col  bg-white shadow-xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-black/70 p-5">
          <div className="flex min-w-0 items-center gap-[10px]">
            <span className="h-11 w-11 rounded shrink-0 bg-black" aria-hidden="true" />
            <div className="min-w-0">
              <h3 id="ticket-dialog-title" className="truncate text-[18px] font-black uppercase leading-[26px] text-black">
                {title}
              </h3>
              <p className="text-[14px] leading-[20px] text-[#6E6B69]">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer ml-3 flex h-7 w-7 shrink-0 items-center justify-center text-[18px] leading-none text-black hover:text-black/60"
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
    <TicketDialogFrame
      title="Create ticket"
      subtitle="Create ticket for event"
      onClose={onClose}
    >
      <form onSubmit={onCreate} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-[14px] overflow-y-auto py-[14px] px-5">
          <InputField
            label="Ticket name"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="ticketName"
            required
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
            placeholder="Type here..."
            containerClassName="mt-1 !h-[86px] !min-h-0 !rounded-[3px] mb-[20px] focus-within:!ring-0"
          />
          <div className="grid grid-cols-2 gap-2 mb-[20px]">
            <InputField
              name="ticketPrice"
              type="number"
              min="0"
              label="Base price"
              labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
              step="0.01"
              defaultValue="0"
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
              defaultValue="500"
              required
              density="compact"
            />
          </div>
          <SelectField
            name="ticketCurrency"
            defaultValue="Dollar"
            label="Currency"
            wrapperClassName="mb-[20px]"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"   
            options={[
              { value: "Dollar", label: "Dollar" },
              { value: "Pound", label: "Pound" },
              { value: "Euro", label: "Euro" },
            ]}
            density="compact"            
          />
          <RadioGroup
            name="badgeLabel"
            legend="Badge label"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            optionClassName="!text-[14px]"
            defaultValue="Most Popular"
            className="mb-[20px]"
            variant="pills"
            options={[
              { value: "Most Popular", label: "Most Popular" },
              { value: "Limited", label: "Limited" },
            ]}
          />
          <InputField
            label="Entitlement"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="entitlement"
            placeholder="Add entitlement"
            density="compact"
            containerClassName="mb-[20px]"
          />
          <SelectField
            label="Status"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            name="ticketStatus"
            defaultValue="Active"
            wrapperClassName="mb-[50px]"
            options={[
              { value: "Active", label: "Active" },
              { value: "Draft", label: "Draft" },
              { value: "Inactive", label: "Inactive" },
            ]}
            density="compact"
          />
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-black/70 px-[14px] py-4">
          <Button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-[3px] border border-black/70 bg-white px-3 text-[14px] font-normal uppercase text-black cursor-pointer hover:bg-black/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-[40px] rounded-[3px] border border-black bg-black px-3 text-[14px] font-normal uppercase text-white cursor-pointer hover:bg-black/80"
          >
            Create product
          </Button>
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
              defaultValue="0"
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
              defaultValue="500"
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
              density="compact"
              containerClassName="mt-1 !h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
              className="!px-1.5 !text-[12px]"
            />
            <InputField
              name="validTo"
              label="Sale end"
              labelClassName="!text-[14px] !leading-[20px]"
              type="datetime-local"
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
            defaultValue="6"
            density="compact"
            containerClassName="mt-1 !h-10 !rounded-[3px] !border-[#777777] focus-within:!ring-0 mb-[20px]"
            className="!px-2 !text-[14px]"
          />
          <RadioGroup
            name="offerAccess"
            legend="Access"
            labelClassName="!text-[14px] !leading-[20px]"
            optionClassName="!text-[14px]"
            defaultValue="Public"
            options={[{ value: "Public", label: "Public" }, { value: "Members only", label: "Members only" }]}
          />
          <SelectField
            name="offerStatus"
            label="Status"
            labelClassName="!text-[14px] !leading-[20px]"
            defaultValue="Active"
            options={[{ value: "Active", label: "Active" }, { value: "Draft", label: "Draft" }, { value: "Inactive", label: "Inactive" }]}
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
            className="h-[40px] rounded-[3px] border border-black/70 bg-white px-3 text-[14px] font-normal uppercase text-black cursor-pointer hover:bg-black/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-[40px] rounded-[3px] border border-black bg-black px-3 text-[14px] font-normal uppercase text-white cursor-pointer hover:bg-black/80"
          >
            Create offer
          </Button>
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
      <div className="mb-[27px] flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[26px] font-black uppercase leading-[24px] tracking-[-0.03em] text-black">Tickets</h3>
        <Button type="button" onClick={() => setDialog({ type: "ticket" })} className="cursor-pointer inline-flex h-[40px] items-center justify-center rounded-[4px] border border-black bg-black px-3 text-[14px] leading-[20px] font-bold uppercase text-white hover:bg-white hover:text-black">
          + Create ticket
        </Button>
      </div>

      <div className="space-y-5">
        {tickets.map((ticket) => {
          const isExpanded = expandedTicketIds.includes(ticket.id);
          const remaining = Math.max(0, ticket.quantityCap - ticket.sold);

          return (
            <article key={ticket.id} className="border border-black/70 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-[18px] leading-[20px] font-bold uppercase text-black">{ticket.name}</h4>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[16px]  leading-[20px] font-bold uppercase text-[#1DB954]">
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
                  <p className="mt-4 mb-[22px] max-w-[1000px] text-[14px] leading-[20px] text-[#6F6E69]">{ticket.description}</p>
                  <dl className="grid grid-cols-2 border border-black/70 md:grid-cols-4">
                    {[
                      { label: "Price", value: `${ticket.currency === "Pound" ? "£" : ticket.currency === "Euro" ? "€" : "$"}${ticket.price.toFixed(2)}` },
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
                          <tr key={offer.id} className="text-[16px] leading-[20px] text-black">
                            <td className="border-b border-black/50 py-[18px] px-3">{offer.name}</td>
                            <td className="border-b border-black/50 py-[18px] px-3">${offer.price.toFixed(2)}</td>
                            <td className="border-b border-black/50 py-[18px] px-3">{offer.quantityCap}</td>
                            <td className="border-b border-black/50 py-[18px] px-3">{offer.validPeriod}</td>
                            <td className="border-b border-black/50 py-[18px] px-3">{offer.access}</td>
                            <td className="border-b border-black/50 py-[18px] px-3">
                              <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[#1DB954]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954]" />{offer.status}</span>
                            </td>
                            <td className="border-b border-black/50 px-2.5 py-3 text-center">
                              <button 
                                type="button" 
                                // aria-label={`Delete ${offer.name} offer`} 
                                // onClick={() => setTickets((current) => current.map((item) => item.id === ticket.id ? { ...item, offers: item.offers.filter((itemOffer) => itemOffer.id !== offer.id) } : item))} 
                                className="cursor-pointer inline-flex h-6 w-6 items-center justify-center rounded-full text-[16px] text-black/65 hover:bg-black/10">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="24" rx="12" fill="#F8F8F7"/>
                                  <path d="M12.0026 12.6693C12.3708 12.6693 12.6693 12.3708 12.6693 12.0026C12.6693 11.6344 12.3708 11.3359 12.0026 11.3359C11.6344 11.3359 11.3359 11.6344 11.3359 12.0026C11.3359 12.3708 11.6344 12.6693 12.0026 12.6693Z" stroke="black" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12.0026 7.9974C12.3708 7.9974 12.6693 7.69892 12.6693 7.33073C12.6693 6.96254 12.3708 6.66406 12.0026 6.66406C11.6344 6.66406 11.3359 6.96254 11.3359 7.33073C11.3359 7.69892 11.6344 7.9974 12.0026 7.9974Z" stroke="black" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12.0026 17.3333C12.3708 17.3333 12.6693 17.0349 12.6693 16.6667C12.6693 16.2985 12.3708 16 12.0026 16C11.6344 16 11.3359 16.2985 11.3359 16.6667C11.3359 17.0349 11.6344 17.3333 12.0026 17.3333Z" stroke="black" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </button>
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
        })}
        {tickets.length === 0 ? <p className="border border-dashed border-black/30 px-4 py-10 text-center text-[13px] text-black/55">No tickets created for {eventTitle} yet.</p> : null}
      </div>

      {dialog?.type === "ticket" ? <CreateTicketDialog onClose={() => setDialog(null)} onCreate={createTicket} /> : null}
      {dialog?.type === "offer" && dialogTicket ? <CreateOfferDialog ticket={dialogTicket} onClose={() => setDialog(null)} onCreate={(event) => createOffer(event, dialog.ticketId)} /> : null}
    </div>
  );
}