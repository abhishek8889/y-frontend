import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-black">
      <div className="w-full max-w-xl rounded-none border border-black/10 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-black uppercase tracking-[-0.06em] text-black">
          Auth Routes
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/70">
          Use the routes below to open the shared auth screens.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <Link
            href="/signup"
            className="flex h-[52px] items-center justify-center border border-black bg-black text-[14px] font-normal uppercase tracking-[0.02em] text-white transition hover:opacity-90"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="flex h-[52px] items-center justify-center border border-black bg-white text-[14px] font-normal uppercase tracking-[0.02em] text-black transition hover:bg-black hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/reset-password"
            className="flex h-[52px] items-center justify-center border border-black bg-white text-[14px] font-normal uppercase tracking-[0.02em] text-black transition hover:bg-black hover:text-white"
          >
            Reset Password
          </Link>
        </div>
      </div>
    </main>
  );
}
