import authHeroImage from "@/assets/signup-image.png";

export function AuthHero() {
  return (
    <aside className="relative h-[420px] min-h-[360px] overflow-hidden bg-black lg:h-screen lg:min-h-[360px]">
      <div
        className="absolute inset-0 bg-cover bg-center grayscale-[1]"
        style={{
          backgroundImage: `url(${authHeroImage.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div
        className="absolute inset-x-0 bottom-0 h-[220px]"
        style={{
          background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)",
        }}
      />

      <div className="relative z-10 flex h-full items-end p-6 sm:p-8 lg:p-12">
        <div className="text-white">
          <h2 className="text-[32px] font-[700] uppercase leading-[38px] tracking-[0px] text-white">
            PLAY WITH PASSION, WIN WITH PRIDE
          </h2>
          <p className="mt-[20px] text-[20px] font-normal leading-[28px] tracking-[0px] text-white/90">
            A club built on dedication, teamwork, and the relentless spirit to
            conquer every game.
          </p>
        </div>
      </div>
    </aside>
  );
}
