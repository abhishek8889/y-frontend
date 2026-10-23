import Image from "next/image";
import Link from "next/link";
import yourlistLogo from "@/assets/yourlist-logo.png";
import { OrderStatusConfirmation } from "@/components/public/OrderStatusConfirmation";
import { SiteFooter } from "@/components/public/SiteFooter";

type SuccessPageProps = {
  searchParams: Promise<{
    order?: string | string[];
  }>;
};

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const query = await searchParams;
  const orderParam = Array.isArray(query.order) ? query.order[0] : query.order;

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="relative flex h-[44px] shrink-0 items-center justify-center border-b border-black/70 px-5">
        <Link href="/" aria-label="Yourlist home" className="inline-flex">
          <Image src={yourlistLogo} alt="Yourlist" priority className="h-auto w-[76px]" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 pb-8 pt-8 sm:px-8 sm:pt-10">
        <OrderStatusConfirmation orderUniqueId={orderParam?.trim() ?? ""} />
      </main>

      <SiteFooter />
    </div>
  );
}
