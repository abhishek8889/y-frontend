"use client";

import type { SiteManageController } from "../useSiteManageDraft";

type SettingsAreaProps = Pick<
  SiteManageController,
  "draft" | "update" | "toast"
>;

export function SettingsArea({ draft, update, toast }: SettingsAreaProps) {
  function saveDomain() {
    const domain = draft.domainInput
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    if (!domain) {
      toast("Enter a domain first.");
      return;
    }
    update({
      domainInput: domain,
      domainConnected: true,
      toast: `${domain} saved for this preview.`,
    });
  }

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

          <div className="csp-domain-state">
            <strong>
              {draft.domainConnected ? "Connected in preview" : "Not connected"}
            </strong>
            <span>
              {draft.domainConnected
                ? "Domain saved for this preview. Finish DNS at your provider, then allow up to 48 hours."
                : "Add your domain above, then complete DNS at your provider."}
            </span>
          </div>

          <button
            type="button"
            className="page-primary-button-action"
            onClick={saveDomain}
          >
            Save domain
          </button>
        </div>
      </section>
    </>
  );
}
