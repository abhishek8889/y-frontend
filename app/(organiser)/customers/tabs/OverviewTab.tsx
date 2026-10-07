import { Button } from "@/components/ui/Button";
import type { Customer, CustomerAction } from "../customerTypes";
import IconCard from "@/components/ui/IconCard";

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
        <section className="border border-black p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold uppercase text-black">Contact information</h2>
            <Button type="button" className="h-7 border border-black cursor-pointer px-3 rounded text-[14px] text-black hover:bg-black hover:text-white">Edit</Button>
          </div>
          <dl className="mt-2 divide-y divide-black/20 text-[14px]">
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
          <section className="border border-black p-6">
            <div className="flex justify-between gap-3">
              <h2 className="text-[16px] font-bold uppercase">Upcoming event</h2>
              <span className="text-[14px] font-bold uppercase">View all tickets →</span>
            </div>
            <p className="mt-8 text-[12px] text-black/55">No upcoming events.</p>
          </section>
          <section className="border border-black p-6">
            <div className="flex justify-between gap-3">
              <h2 className="text-[16px] font-bold uppercase">Past events</h2>
              <span className="text-[14px] font-bold uppercase">View all →</span>
            </div>
            <p className="mt-8 text-[12px] text-black/55">No past events.</p>
          </section>
        </div>
      </div>
      <aside className="h-fit border border-black p-6">
        <h2 className="text-[16px] font-bold uppercase">Actions</h2>
        <div className="mt-4 space-y-2">
          {[
            { label: "Send message", action: "message", icon: "send-message-icon" },
            { label: "View orders", icon: "view-orders-icon" },
            { label: "View tickets", icon: "view-tickets-icon" },
            { label: "Issue complimentary ticket", action: "ticket", icon: "issue-ticket-icon" },
            { label: "Suspend account", action: "suspend", icon: "suspend-account-icon" },
          ].map(({ label, action, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (action) onAction(action as CustomerAction);
              }}
              className="flex min-h-[36px] gap-[12px] w-full items-center cursor-pointer border border-[#DFE3E8] rounded-[6px] px-2 text-left text-[14px] hover:bg-black/5"
            >
              <IconCard name={icon} className="mr-2" />
              {label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}