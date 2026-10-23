import { AccountDetails } from "@/components/public/AccountDetails";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";

export default function PublicAccountPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <PublicSiteHeader />
      <AccountDetails />
      <SiteFooter />
    </main>
  );
}
