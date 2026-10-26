import Image from "next/image";
import Link from "next/link";
import brandLogo from "@/assets/yourlist-logo.png";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-[80px] shrink-0 items-center border-b border-black bg-white px-5 sm:px-10">
      <Link href="/" aria-label="Yourlist home" className="inline-flex">
        <Image
          className="h-[40px] w-[126px] object-contain"
          src={brandLogo}
          alt="YourList logo"
          width={126}
          height={40}
          priority
        />
      </Link>
    </header>
  );
}
