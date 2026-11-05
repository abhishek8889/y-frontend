"use client";

import { MicrositeHome } from "@/components/microsite/MicrositeHome";
import { PublicHome } from "@/components/public/PublicHome";
import { useIsMicrosite } from "@/lib/public/hostResolution";

export default function HomePage() {
  const isMicrosite = useIsMicrosite();
  return isMicrosite ? <MicrositeHome /> : <PublicHome />;
}
