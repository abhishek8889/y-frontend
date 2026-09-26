import type { ReactNode } from "react";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthHero } from "@/components/auth/AuthHero";

interface AuthPageProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPage({ title, subtitle, children, footer }: AuthPageProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[0.96fr_1.04fr]">
      <section className="flex min-h-screen flex-col bg-white">
        <AuthHeader />

        <div className="mx-auto flex w-full max-w-[33rem] flex-1 flex-col px-[20px] pt-8 sm:px-[40px] sm:pt-10">
          <h1 className="text-[32px] font-bold uppercase leading-[38px] tracking-[0px] text-black">
            {title}
          </h1>
          <p className="mt-[6px] text-[14px] font-normal leading-[24px] text-black/100">
            {subtitle}
          </p>

          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-[57px] w-full border-t border-black py-[30px]">
            {footer}
          </div>
        ) : null}
      </section>

      <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        <AuthHero />
      </div>
    </main>
  );
}
