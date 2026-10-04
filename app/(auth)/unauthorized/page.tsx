import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/50">403</p>
        <h1 className="mt-3 text-[28px] font-black uppercase tracking-[-0.04em]">Access denied</h1>
        <p className="mt-3 text-[14px] leading-6 text-black/65">
          You do not have permission to view this area with your current role.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-[48px] items-center justify-center border border-black bg-black px-6 text-[12px] font-bold uppercase tracking-[0.06em] text-white"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
