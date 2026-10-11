import Image from "next/image";
import Link from "next/link";
import yourlistLogo from "@/assets/yourlist-logo.png";

export function SiteHeader({ activePage }: { activePage?: "about" | "events" | "news" }) {
  const navigationLinks = [
    { label: "About", href: "/about", page: "about" },
    { label: "Events", href: "/events", page: "events" },
    { label: "News", href: "/", page: "news" },
  ] as const;

  return (
    <header className="relative flex h-[44px] items-center justify-between border-b border-black/80 px-4 sm:px-6">
      <nav aria-label="Main navigation" className="flex items-center gap-4 sm:gap-6">
        {navigationLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={activePage === item.page ? "page" : undefined}
            className={[
              "text-[9px] font-medium uppercase sm:text-[10px]",
              activePage === item.page
                ? "border border-black/50 px-2 py-1"
                : "hover:opacity-60",
            ].join(" ")}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/"
        aria-label="YourList home"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Image src={yourlistLogo} alt="YourList" className="h-auto w-[76px] sm:w-[88px]" priority />
      </Link>

      <nav aria-label="Account navigation" className="ml-auto flex items-center gap-2 sm:gap-4">
        <Link href="/login" className="text-[9px] font-medium uppercase hover:opacity-60 sm:text-[10px]">
          Login
        </Link>
        <Link href="/login" aria-label="Your favorites" className="text-[13px] leading-none">
          ♡
        </Link>
        <a
          href="mailto:yourlist@gmail.com"
          className="bg-black px-3 py-2 text-[8px] font-medium uppercase text-white hover:bg-black/75 sm:px-5 sm:text-[9px]"
        >
          Contact us
        </a>
      </nav>
    </header>
  );
}
