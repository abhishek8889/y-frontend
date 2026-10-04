import { Button } from "@/components/ui/Button";
import type { Customer, CustomerAction } from "../customerTypes";

export default function OverviewTab({
  customer,
  onAction,
}: {
  customer: Customer;
  onAction: (action: CustomerAction) => void;
}) {
  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <div role="tabpanel" className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(230px,0.82fr)]">
      <div className="space-y-4">
        <section className="border border-black p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-bold uppercase text-black">Contact information</h2>
            <Button type="button" className="h-7 border border-black px-3 text-[11px] text-black hover:bg-black hover:text-white">Edit</Button>
          </div>
          <dl className="mt-2 divide-y divide-black/20 text-[11px]">
            {[
              ["Full name", fullName],
              ["Email", customer.email],
              ["Phone", customer.phone || "-"],
              ["Customer ID", `CUST-${String(customer.id).slice(-6)}`],
              ["Date joined", "12 Jan 2024"],
              ["Location", "Birmingham, UK"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2">
                <dt>{label}</dt><dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="min-h-[170px] border border-black p-4">
            <div className="flex justify-between gap-3"><h2 className="text-[12px] font-bold uppercase">Upcoming event</h2><span className="text-[11px] font-bold uppercase">View all tickets →</span></div>
            <p className="mt-8 text-[12px] text-black/55">No upcoming events.</p>
          </section>
          <section className="min-h-[170px] border border-black p-4">
            <div className="flex justify-between gap-3"><h2 className="text-[12px] font-bold uppercase">Past events</h2><span className="text-[11px] font-bold uppercase">View all →</span></div>
            <p className="mt-8 text-[12px] text-black/55">No past events.</p>
          </section>
        </div>
      </div>
      <aside className="h-fit border border-black p-4">
        <h2 className="text-[12px] font-bold uppercase">Actions</h2>
        <div className="mt-4 space-y-2">
          {[
            { label: "Send message", action: "message" },
            { label: "View orders" },
            { label: "View tickets" },
            { label: "Issue complimentary ticket", action: "ticket" },
            { label: "Suspend account", action: "suspend" },
          ].map(({ label, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (action) onAction(action as CustomerAction);
              }}
              className="flex min-h-[32px] w-full items-center border border-[#dce1e7] px-2 text-left text-[11px] hover:bg-black/5"
            >
              {label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}