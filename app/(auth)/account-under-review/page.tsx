import type { Metadata } from "next";
import brandLogo from "@/assets/yourlist-logo.png";
import reviewImage from "@/assets/signup-image.png";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Account Under Review",
  description: "Your account is currently under review pending admin approval.",
};

export default function AccountUnderReviewPage() {
  return (
    <main className="min-h-screen bg-[#c9c9c9]">
      <div className="mx-auto flex min-h-[100vh] overflow-hidden bg-white">
        <div className="flex w-full flex-col lg:flex-row">
          <section className="flex w-full flex-col bg-white lg:w-[52%]">
            <div className="border-b border-[#000000] py-5 px-10 text-[11px] font-medium uppercase tracking-[0.2em] text-white md:px-7">
                <Image
                    className="object-contain"
                    src={brandLogo}
                    alt="YourList logo"
                    width={126}
                    height={40}
                />
            </div>

            <div className="flex flex-1 flex-col px-5 pb-8 pt-6 md:px-8 lg:pt-8">

              <div className="flex flex-1 items-center justify-center py-10">
                <div className="flex w-full max-w-[540px] flex-col items-center justify-center text-center">
                  <div className="mb-[30px] flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black text-[2.6rem] font-bold text-black">
                    i
                  </div>

                  <h1 className="text-[24px] font-bold uppercase leading-[38px] tracking-[0%] text-center text-black md:text-[24px]">
                    Your account is under review
                  </h1>

                  <p className="mt-2.5 max-w-[430px] text-[16px] leading-[26px ] text-black/100">
                    Thank you for registering as an organiser on Yourlist. Our team is currently reviewing your account and the submitted information. You&apos;ll be notified once your account is approved.
                  </p>

                  <a
                    href="mailto:support@yourlist.com"
                    className="mt-5 inline-flex h-[40px] items-center justify-center gap-2 rounded-[4px] border border-black bg-white px-[16px] py-0 font-[Univers] text-[14px] font-normal leading-[19.6px] text-black transition-colors duration-200 hover:bg-black hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
                      <path d="M2.5 4.5A1.5 1.5 0 0 1 4 3h8a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 12 12H4a1.5 1.5 0 0 1-1.5-1.5v-7Z" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2.8 4.5 8 8.5l5.2-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </section>

          <aside className="relative flex min-h-[420px] w-full flex-1 overflow-hidden bg-[#0d0d0d] lg:min-h-full">
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center grayscale-[0.9] brightness-[0.5]"
              style={{
                backgroundImage: `url(${reviewImage.src})`,
              }}
            />
            <div className="absolute inset-0 bg-black/45" />

            <div className="relative z-10 flex h-full w-full items-end text-white py-[78px] px-[62px]">
              <div className="">
                <h2 className="text-[32px] font-black uppercase leading-[38px]">
                  Play with passion, win with pride
                </h2>
                <p className="mt-5 text-base text-[20px] leading-[28px] text-white/100">
                  A club built on dedication, teamwork, and the relentless spirit to conquer every game.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
