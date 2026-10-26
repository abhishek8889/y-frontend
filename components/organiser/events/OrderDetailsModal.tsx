"use client";

import { StatusBadge } from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";

export type EventOrderDetails = {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  tickets: string;
  ticketCount: number;
  payment: string;
  source: string;
  amount: number;
  date: string;
  status: string;
};

type OrderDetailsModalProps = {
  open: boolean;
  order: EventOrderDetails | null;
  onClose: () => void;
};

function formatGbp(amount: number) {
  return `£${amount.toFixed(2)}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-black/10 py-2.5 last:border-0">
      <dt className="font-heading text-[12px] font-bold uppercase text-[#AAAAAC]">{label}</dt>
      <dd className="text-[14px] leading-[20px] text-black">{value}</dd>
    </div>
  );
}

export function OrderDetailsModal({ open, order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="order-details-title"
      panelClassName="max-w-[560px] p-6"
    >
      <h2
        id="order-details-title"
        className="font-heading pr-8 text-[22px] font-bold uppercase leading-none tracking-[-0.03em] text-black"
      >
        Order details
      </h2>
      <p className="mt-2 text-[14px] text-[#6F6E69]">{order.orderId}</p>

      <dl className="mt-6">
        <DetailRow label="Customer" value={`${order.customerName} (${order.customerEmail})`} />
        <DetailRow label="Tickets" value={`${order.tickets} × ${order.ticketCount}`} />
        <DetailRow label="Payment" value={order.payment} />
        <DetailRow label="Source" value={order.source} />
        <DetailRow label="Amount" value={formatGbp(order.amount)} />
        <DetailRow label="Date" value={order.date} />
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 py-2.5">
          <dt className="font-heading text-[12px] font-bold uppercase text-[#AAAAAC]">Status</dt>
          <dd>
            <StatusBadge status={order.status} className="text-[14px]" />
          </dd>
        </div>
      </dl>
    </OrganiserModal>
  );
}
