import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site flex min-h-screen flex-col bg-white text-black">
      <PublicSiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
