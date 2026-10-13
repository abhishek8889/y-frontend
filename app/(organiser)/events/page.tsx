import { headers } from "next/headers";
import { PublicEventsPage } from "@/components/public/PublicEventsPage";
import { getHostSurface } from "@/lib/hosts";
import OrganiserEventsClient from "./OrganiserEventsClient";

export default async function EventsRoute() {
  const host = (await headers()).get("host") ?? "";

  if (getHostSurface(host) === "public") {
    return <PublicEventsPage />;
  }

  return <OrganiserEventsClient />;
}
