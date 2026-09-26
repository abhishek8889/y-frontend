import Image from "next/image";
import brandLogo from "@/assets/yourlist-logo.png";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black bg-white px-[40px] py-[20px]">
      <Image
        className="object-contain"
        src={brandLogo}
        alt="YourList logo"
        width={126}
        height={40}
      />
    </header>
  );
}
