import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";

export default function PublicSettingsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <PublicSiteHeader />
      <div className="mx-auto max-w-[720px] px-5 py-12 md:px-8">
        <h1 className="text-[24px] font-bold uppercase leading-[32px]">Setting</h1>
        <p className="mt-3 text-[14px] leading-[22px] text-black/70">
          Account settings will appear here.
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
