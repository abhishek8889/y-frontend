"use client";

import { SiteDnsRecordsTable } from "../../components/SiteDnsRecordsTable";
import type { SiteManageController } from "../useSiteManageDraft";

type SettingsAreaProps = Pick<
  SiteManageController,
  "site" | "draft" | "update" | "saveDomain" | "isSavingDomain"
>;

export function SettingsArea({
  site,
  draft,
  update,
  saveDomain,
  isSavingDomain,
}: SettingsAreaProps) {
  const isPublished = draft.siteStatus !== "draft" || siteLifecycleIsLive(site.status);
  const showDns =
    (site.vercelAdded || site.dnsRecords.length > 0) &&
    (isPublished || site.dnsRecords.length > 0);
  const dnsRecords = site.dnsRecords;

  return (
    <>
      <div className="csp-intro section-heading">
        <div>
          <h2 className="section-title">Domain & Identity</h2>
          <p className="page-subtitle csp-intro-copy">
            Connect your custom domain. Public name is edited under Website → Header & footer.
          </p>
        </div>
      </div>

      <section className="csp-panel csp-domain-identity">
        <div className="csp-panel-body">
          <label>
            <span className="input-heading">Domain</span>
            <input
              className="csp-input"
              placeholder="e.g. club.example.com"
              value={draft.domainInput}
              disabled={isSavingDomain}
              onChange={(event) => update({ domainInput: event.target.value })}
            />
          </label>

          <div className="csp-domain-procedure">
            <h3 className="csp-domain-procedure-title">
              Procedure to customise your domain
            </h3>
            <ol className="csp-domain-procedure-list">
              <li>Add your domain</li>
              <li>Put DNS records in your DNS provider</li>
              <li>Wait for 48 hours</li>
            </ol>
          </div>

          {showDns ? (
            <div className="csp-domain-dns">
              <h3 className="csp-domain-procedure-title">DNS instructions</h3>
              <p className="csp-panel-lead">
                {site.domainHostname
                  ? `Add these records at your provider for ${site.domainHostname}.`
                  : "Add these records at your DNS provider."}{" "}
                Copy the name and value for each row.
              </p>
              <SiteDnsRecordsTable records={dnsRecords} />
            </div>
          ) : null}

          <div className="csp-domain-state">
            <strong>
              {draft.domainConnected
                ? site.vercelAdded || showDns
                  ? "Connected"
                  : "Domain saved"
                : "Not connected"}
            </strong>
            <span>
              {draft.domainConnected
                ? showDns
                  ? "Finish DNS at your provider, then allow up to 48 hours for verification."
                  : "Domain saved. Publish the site to connect it on Vercel and get DNS records."
                : "Add your domain above, then complete DNS at your provider."}
            </span>
          </div>

          <button
            type="button"
            className="page-primary-button-action"
            disabled={isSavingDomain}
            onClick={() => {
              void saveDomain();
            }}
          >
            {isSavingDomain ? "Saving…" : "Save domain"}
          </button>
        </div>
      </section>
    </>
  );
}

function siteLifecycleIsLive(status: string | null | undefined): boolean {
  const raw = String(status ?? "").trim().toLowerCase();
  return raw === "active" || raw === "live" || raw === "published";
}
