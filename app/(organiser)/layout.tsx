import { OrganiserApprovalGate } from "@/components/auth/OrganiserApprovalGate";

export default function OrganiserLayout({ children }: { children: React.ReactNode }) {
  return <OrganiserApprovalGate>{children}</OrganiserApprovalGate>;
}
