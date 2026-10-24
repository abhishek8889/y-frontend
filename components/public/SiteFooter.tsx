"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import yourlistLogo from "@/assets/yourlist-logo.png";
import { buildSurfaceUrl } from "@/lib/hosts";

export function SiteFooter() {
  const [host, setHost] = useState<string | undefined>(undefined);

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  const footerGroups = useMemo(
    () => [
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
          { label: "Explore Events", href: "/" },
          { label: "My tickets", href: "/login" },
        ],
      },
      {
        title: "Organizer",
        links: [
          {
            label: "Promote an event",
            href: host ? buildSurfaceUrl("organiser", "/signup", host) : "#",
          },
          {
            label: "List your event",
            href: host ? buildSurfaceUrl("organiser", "/login", host) : "#",
          },
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
    ],
    [host],
  );

  return (
    <footer className="border-t border-black bg-white text-black">
      <div className="flex h-[50px] items-center border-b border-black px-5">
        <Link href="/" aria-label="Yourlist home" className="inline-flex">
          <Image src={yourlistLogo} alt="Yourlist" className="h-[31px] w-[97px] object-contain" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {footerGroups.map((group) => (
          <section key={group.title} className="min-h-[185px] border-r border-b border-black px-5 py-[15px]">
            <h2 className="text-[14px] leading-[15.6px] tracking-[0.36px]">{group.title}</h2>
            <ul className="mt-4 space-y-1">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("http") ||
                  link.href.startsWith("mailto:") ||
                  link.href === "#" ? (
                    <a href={link.href} className="text-[14px] leading-[19.6px] hover:underline">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-[14px] leading-[19.6px] hover:underline">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="min-h-[185px] border-b border-black px-5 py-[15px] sm:border-r">
          <h2 className="text-[14px] leading-[15.6px] tracking-[0.36px]">Contact us</h2>
          <ul className="mt-4 space-y-1">
            <li>
              <a href="tel:+44123456789" className="flex items-center gap-2 text-[14px] leading-4 hover:underline">
                <img src="/landing/phone.svg" width={17} height={17} alt="" />
                123456789
              </a>
            </li>
            <li>
              <a
                href="mailto:yourlist@gmail.com"
                className="flex items-center gap-2 text-[14px] leading-4 hover:underline"
              >
                <img src="/landing/email.svg" width={17} height={17} alt="" />
                yourlist@gmail.com
              </a>
            </li>
          </ul>
        </section>
      </div>

      <p className="px-3 py-2 text-center text-[12px] leading-[18px]">
        © 2025 yourlist Ltd. All Rights Reserved.
      </p>
    </footer>
  );
}
