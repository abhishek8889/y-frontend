import { getPrimaryScope, type AuthUserLike } from "@/lib/auth/roles";
import { AuthScope } from "@/lib/auth/scopes";

export type OrganisationApprovalUser = AuthUserLike & {
  organisation_approve_status?: boolean | number | string | null;
};

/** Treat false / 0 / "false" as pending; ignore missing status. */
export function isOrganisationPendingApproval(user: OrganisationApprovalUser | null | undefined) {
  if (!user || getPrimaryScope(user) !== AuthScope.Organisation) return false;
  const status = user.organisation_approve_status;
  return status === false || status === 0 || status === "false";
}

export function isOrganisationApproved(user: OrganisationApprovalUser | null | undefined) {
  if (!user || getPrimaryScope(user) !== AuthScope.Organisation) return false;
  const status = user.organisation_approve_status;
  return status === true || status === 1 || status === "true";
}
