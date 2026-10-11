import { headers } from "next/headers";
import { OrganiserEventsPage } from "./OrganiserEventsPage";
import { PublicEventsPage } from "@/components/public/PublicEventsPage";
import { getHostSurface } from "@/lib/hosts";

export default async function EventsRoute() {
  const host = (await headers()).get("host") ?? "";

  if (getHostSurface(host) === "public") {
    return <PublicEventsPage />;
  }

  return <OrganiserEventsPage />;
}
