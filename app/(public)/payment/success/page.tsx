import { OrderStatusConfirmation } from "@/components/public/OrderStatusConfirmation";

type SuccessPageProps = {
  searchParams: Promise<{
    order?: string | string[];
  }>;
};

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const query = await searchParams;
  const orderParam = Array.isArray(query.order) ? query.order[0] : query.order;

  return (
    <main className="flex min-w-0 flex-1 flex-col items-center bg-white px-4 pb-10 pt-8 text-black sm:px-8 sm:pt-10">
      <OrderStatusConfirmation orderUniqueId={orderParam?.trim() ?? ""} />
    </main>
  );
}
