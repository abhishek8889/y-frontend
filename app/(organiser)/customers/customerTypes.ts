export type CustomerStatus = "active" | "inactive" | "suspended";

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
  ticketsPurchased: number;
  lastActivity: string;
  customerSince: string;
};

export type CustomerAction = "message" | "ticket" | "suspend";

export const CUSTOMER_SEED: Customer[] = [
  {
    id: 1,
    customerId: "SUP-0012",
    firstName: "Smith",
    lastName: "Jon",
    email: "user@gmail.com",
    phone: "+44 7712 345678",
    entitlement: "",
    status: "active",
    totalOrders: 5,
    attended: 24,
    totalSpend: 1240,
    ticketsPurchased: 6,
    lastActivity: "12 Jan 2025",
    customerSince: "12 Jan 2024",
  },
  {
    id: 2,
    customerId: "CUST-00124",
    firstName: "James",
    lastName: "Taylor",
    email: "james.taylor@gmail.com",
    phone: "+44 7712 345678",
    entitlement: "",
    status: "active",
    totalOrders: 5,
    attended: 4,
    totalSpend: 245,
    ticketsPurchased: 6,
    lastActivity: "12 Jan 2025",
    customerSince: "12 Jan 2024",
  },
  {
    id: 3,
    customerId: "SUP-0048",
    firstName: "Sarah",
    lastName: "Bell",
    email: "sarah@email.com",
    phone: "+44 7700 900123",
    entitlement: "Member",
    status: "active",
    totalOrders: 12,
    attended: 9,
    totalSpend: 860,
    ticketsPurchased: 18,
    lastActivity: "2 Sep 2026",
    customerSince: "8 Mar 2023",
  },
  {
    id: 4,
    customerId: "SUP-0091",
    firstName: "Mike",
    lastName: "Carter",
    email: "mike.carter@email.com",
    phone: "+44 7700 111222",
    entitlement: "",
    status: "inactive",
    totalOrders: 2,
    attended: 1,
    totalSpend: 48,
    ticketsPurchased: 2,
    lastActivity: "14 Feb 2025",
    customerSince: "19 Nov 2024",
  },
  {
    id: 5,
    customerId: "SUP-0110",
    firstName: "Laura",
    lastName: "Black",
    email: "laura.black@email.com",
    phone: "+44 7700 333444",
    entitlement: "",
    status: "suspended",
    totalOrders: 7,
    attended: 3,
    totalSpend: 312,
    ticketsPurchased: 8,
    lastActivity: "30 Aug 2025",
    customerSince: "4 Jan 2024",
  },
];

export function customerFullName(customer: Customer) {
  return `${customer.firstName} ${customer.lastName}`.trim();
}

export function customerInitials(customer: Customer) {
  return `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();
}

export function formatCustomerSpend(amount: number) {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
