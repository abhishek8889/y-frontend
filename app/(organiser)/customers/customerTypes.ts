export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entitlement: string;
};

export type CustomerAction = "message" | "ticket" | "suspend";