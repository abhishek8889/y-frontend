import Image from "next/image";
import Link from "next/link";
import yourlistLogo from "@/assets/yourlist-logo.png";

const footerGroups = [
  {
    title: "Your list",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Support", href: "mailto:support@yourlist.com" },
    ],
  },
  {
    title: "Customer",
    links: [
      { label: "Explore Events", href: "/events" },
      { label: "My tickets", href: "/login" },
    ],
  },
  {
    title: "Organizer",
    links: [
      { label: "Promote an event", href: "/signup" },
      { label: "List your event", href: "/dashboard" },
    ],
  },
  {
    title: "Follow us",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "Twitter", href: "https://www.twitter.com/" },
      { label: "Facebook", href: "https://www.facebook.com/" },
      { label: "Youtube", href: "https://www.youtube.com/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black bg-white text-black">
      <div className="flex h-[36px] items-center border-b border-black/70 px-4 md:px-6">
        <Link href="/" aria-label="Yourlist home" className="inline-flex">
          <Image src={yourlistLogo} alt="Yourlist" className="h-auto w-[70px]" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {footerGroups.map((group) => (
          <section key={group.title} className="min-h-[112px] border-b border-r border-black/70 px-4 py-3 last:border-r-0 sm:px-5">
            <h2 className="text-[10px] font-bold uppercase leading-[14px]">{group.title}</h2>
            <ul className="mt-2 space-y-1">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[11px] leading-[15px] hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="col-span-2 min-h-[112px] border-b border-black/70 px-4 py-3 sm:col-span-1 sm:border-r sm:px-5">
          <h2 className="text-[10px] font-bold uppercase leading-[14px]">Contact us</h2>
          <ul className="mt-2 space-y-1">
            <li>
              <a href="tel:+44123456789" className="flex items-center gap-2 text-[11px] leading-[15px] hover:underline">
                <span aria-hidden="true">⌕</span> 123456789
              </a>
            </li>
            <li>
              <a href="mailto:yourlist@gmail.com" className="flex items-center gap-2 text-[11px] leading-[15px] hover:underline">
                <span aria-hidden="true">✉</span> yourlist@gmail.com
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="flex min-h-[29px] items-center justify-center px-3 py-2 text-center text-[9px] leading-[13px]">
        © 2025 yourlist Ltd. All Rights Reserved.
      </div>
    </footer>
  );
}