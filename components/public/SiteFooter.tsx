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
        title: "Customer",
        links: [
          { label: "Explore Events", href: "/#events" },
          { label: "My tickets", href: "/orders" },
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

  const brandLinks = [
    { label: "About Us", href: "/#about" },
    { label: "Support", href: "mailto:support@yourlist.com" },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section className="site-footer__col">
          <Link href="/" aria-label="Yourlist home" className="site-footer__logo">
            <Image
              src={yourlistLogo}
              alt="Yourlist"
              width={52}
              height={17}
              className="site-footer__logo-img"
            />
          </Link>
          <ul className="site-footer__links">
            {brandLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("mailto:") ? (
                  <a href={link.href} className="site-footer__link">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="site-footer__link">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        {footerGroups.map((group) => (
          <section key={group.title} className="site-footer__col">
            <h2 className="site-footer__heading">{group.title}</h2>
            <ul className="site-footer__links">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("http") ||
                  link.href.startsWith("mailto:") ||
                  link.href === "#" ? (
                    <a href={link.href} className="site-footer__link">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="site-footer__link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="site-footer__col">
          <h2 className="site-footer__heading">Contact us</h2>
          <ul className="site-footer__links">
            <li>
              <a href="tel:+44123456789" className="site-footer__contact">
                <img src="/landing/phone.svg" width={17} height={17} alt="" />
                123456789
              </a>
            </li>
            <li>
              <a href="mailto:yourlist@gmail.com" className="site-footer__contact">
                <img src="/landing/email.svg" width={17} height={17} alt="" />
                yourlist@gmail.com
              </a>
            </li>
          </ul>
        </section>
      </div>

      <p className="public-bar site-footer__copy">
        © 2025 yourlist Ltd. All Rights Reserved.
      </p>
    </footer>
  );
}
