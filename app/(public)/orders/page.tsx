import { MyOrdersList } from "@/components/public/MyOrdersList";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";

export default function PublicOrdersPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <PublicSiteHeader />
      <MyOrdersList />
      <SiteFooter />
    </main>
  );
}
