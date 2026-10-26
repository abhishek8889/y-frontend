import authHeroImage from "@/assets/signup-image.png";

export function AuthHero() {
  return (
    <aside className="relative hidden h-full min-h-[420px] overflow-hidden bg-black lg:block lg:min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center grayscale"
        style={{
          backgroundImage: `url(${authHeroImage.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div
        className="absolute inset-x-0 bottom-0 h-[398px]"
        style={{
          background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)",
        }}
      />

      <div className="relative z-10 flex h-full items-end px-8 pb-[78px] pt-12 xl:px-[78px]">
        <div className="max-w-[540px] text-white">
          <h2 className="font-heading text-[28px] leading-[34px] text-white xl:text-[32px] xl:leading-[38px]">
            Play with Passion, Win with Pride
          </h2>
          <p className="mt-5 text-[18px] font-normal leading-[26px] text-white xl:text-[20px] xl:leading-[28px]">
            A club built on dedication, teamwork, and the relentless spirit to conquer every game.
          </p>
        </div>
      </div>
    </aside>
  );
}
