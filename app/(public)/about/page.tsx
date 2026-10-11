import Image from "next/image";
import homeHeroImage from "@/assets/home-hero.jpg";
import { SiteFooter, SiteHeader } from "@/components/public";

const aboutCopy =
  "As music is an inherent part of Balenciaga’s culture and creative force, the Balenciaga Music platform was conceived to offer a 360 experience that includes hand-selected playlists, limited-edition merchandise, exclusive content, and interactive campaigns. It introduces mixes made by a variety of artists working all over the world through a large variety of genres, individually selected by Demna. These artists are invited to share their musical influences, collaborate on products, and/or produce original compositions—especially for Balenciaga. The platform also catalogues sounds created for runway shows and other activations. The development of new technology, such as wearable NFC chips, allows for special listening experiences within this ever-evolving project.";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader activePage="about" />

      <section
        aria-labelledby="about-heading"
        className="relative flex h-[70vh] items-center justify-center overflow-hidden bg-black"
      >
        <Image
          src={homeHeroImage}
          alt="A crowd enjoying a live music event"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        <h1
          id="about-heading"
          className="relative z-10 text-[36px] font-bold uppercase leading-none tracking-[0.02em] text-white sm:text-[48px]"
        >
          About
        </h1>
      </section>

      <section className="flex min-h-[210px] items-center justify-center border-b border-black/25 px-6 py-12 sm:min-h-[245px]">
        <p className="max-w-[560px] text-center text-[16px] leading-[24px] text-black">
          {aboutCopy}
        </p>
      </section>

      <SiteFooter variant="about" />
    </main>
  );
}
