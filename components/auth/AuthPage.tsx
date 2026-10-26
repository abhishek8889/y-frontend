import type { ReactNode } from "react";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthHero } from "@/components/auth/AuthHero";

interface AuthPageProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Extra top padding for shorter forms like login. */
  contentClassName?: string;
}

export function AuthPage({
  title,
  subtitle,
  children,
  footer,
  contentClassName = "",
}: AuthPageProps) {
  return (
    <main className="auth-site grid min-h-screen bg-white text-black lg:grid-cols-2">
      <section className="flex min-h-screen flex-col bg-white">
        <AuthHeader />

        <div
          className={`mx-auto flex w-full max-w-[452px] flex-1 flex-col px-5 pt-8 sm:px-0 sm:pt-12 ${contentClassName}`.trim()}
        >
          <h1 className="font-heading text-[28px] leading-[34px] text-[#161616] sm:text-[32px] sm:leading-[38px]">
            {title}
          </h1>
          <p className="mt-1.5 text-[14px] font-normal leading-6 text-black">{subtitle}</p>

          <div className="mt-6 pb-10 sm:mt-8">{children}</div>
        </div>

        {footer ? (
          <div className="mt-auto w-full border-t border-black py-[30px]">
            {footer}
          </div>
        ) : null}
      </section>

      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        <AuthHero />
      </div>
    </main>
  );
}
