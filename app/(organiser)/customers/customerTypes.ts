export type CustomerStatus = "active" | "inactive" | "suspended";

export type CustomerLastOrder = {
  id: number;
  uniqueId: string;
  totalAmount: number;
  paidAt: string;
};

export type Customer = {
  id: number;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entitlement: string;
  status: CustomerStatus;
  totalOrders: number;
  attended: number;
  totalSpend: number;
  totalRefunded: number;
  ticketsPurchased: number;
  lastActivity: string;
  customerSince: string;
  location?: string;
  lastOrder?: CustomerLastOrder | null;
};

export type CustomerAction = "message" | "ticket" | "suspend";

export function customerFullName(customer: Customer) {
  return `${customer.firstName} ${customer.lastName}`.trim();
}

export function customerInitials(customer: Customer) {
  return `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();
}

export function formatCustomerSpend(amount: number) {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
