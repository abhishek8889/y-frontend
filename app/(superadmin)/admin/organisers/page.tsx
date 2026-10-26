import { redirect } from "next/navigation";

/** Legacy path — organisations list lives at `/admin/organisations`. */
export default function AdminOrganisersRedirectPage() {
  redirect("/admin/organisations");
}
