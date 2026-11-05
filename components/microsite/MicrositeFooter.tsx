"use client";

import Link from "next/link";
import {
  siteDisplayName,
  siteLogoUrl,
  siteNavigation,
  useHostResolution,
} from "@/lib/public/hostResolution";

/**
 * Microsite footer — same structure as public footer.
 * Brand column uses site logo + all site navigation links.
 * Keeps Customer + Follow us (+ Contact).
 */
export function MicrositeFooter() {
  const { resolution } = useHostResolution();
  const logoSrc = siteLogoUrl(resolution);
  const siteName = siteDisplayName(resolution);
  const navigation = siteNavigation(resolution);

  const footerGroups = [
    {
      title: "Customer",
      links: [
        { label: "Explore Events", href: "/#events" },
        { label: "My tickets", href: "/orders" },
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

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section className="site-footer__col">
          <Link href="/" aria-label={`${siteName} home`} className="site-footer__logo">
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt={siteName}
                width={52}
                height={17}
                className="site-footer__logo-img h-[17px] w-auto max-w-[120px] object-contain"
              />
            ) : (
              <span className="text-[12px] uppercase tracking-[0.08em]">{siteName}</span>
            )}
          </Link>
          <ul className="site-footer__links">
            {navigation.map((item) => (
              <li key={`f-${item.name}-${item.redirect_link}`}>
                <Link href={item.redirect_link} className="site-footer__link">
                  {item.name}
                </Link>
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
                  {link.href.startsWith("http") ? (
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
        © {new Date().getFullYear()} {siteName}. All Rights Reserved.
      </p>
    </footer>
  );
}
