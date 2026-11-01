"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  isApiSiteId,
  useUpdateOrganisationSiteDomainMutation,
  type SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import { InputField } from "@/components/ui/InputField";
import { SiteDnsRecordsTable } from "../components/SiteDnsRecordsTable";

export default function DomainTab({
  siteId,
  siteName: _siteName,
  connectedDomain,
  dnsRecords,
  onConnected,
  notice,
}: {
  siteId: string;
  siteName: string;
  connectedDomain: string;
  dnsRecords: SiteDnsRecord[];
  onConnected: (
    domain: string,
    dnsRecords: SiteDnsRecord[],
    siteId?: string | null,
    nextDomainStatus?: string | null,
  ) => void;
  notice: string;
}) {
  const [domainInput, setDomainInput] = useState(connectedDomain);
  const [domainError, setDomainError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [updateDomain, { isLoading: isUpdating }] = useUpdateOrganisationSiteDomainMutation();

  const liveHostname = connectedDomain || domainInput.trim();
  const showDnsSetup = Boolean(liveHostname) && dnsRecords.length > 0;

  useEffect(() => {
    setDomainInput(connectedDomain);
  }, [connectedDomain]);

  async function handleUpdateDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const domain = domainInput.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (!domain || !/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) {
      setDomainError("Enter a valid domain, such as www.yourclub.com.");
      setFormNotice("");
      return;
    }

    if (!isApiSiteId(siteId)) {
      setDomainError("Save the site before updating its domain.");
      return;
    }

    setDomainError("");
    setFormNotice("");

    try {
      const result = await updateDomain({ siteId, domain }).unwrap();
      const records = Array.isArray(result.data?.dns_records) ? result.data.dns_records : [];
      const siteDomain =
        result.data?.site?.domain && typeof result.data.site.domain === "object"
          ? result.data.site.domain
          : null;
      const hostnameFromSite =
        siteDomain && typeof siteDomain.hostname === "string"
          ? siteDomain.hostname.trim()
          : "";
      const nextStatus =
        siteDomain && typeof siteDomain.status === "string" ? siteDomain.status : null;
      const nextDomain = hostnameFromSite || domain;

      setDomainInput(nextDomain);
      setFormNotice(`Domain updated to ${nextDomain}.`);
      onConnected(nextDomain, records, siteId, nextStatus);
    } catch {
      // Toast handled by mutation.
    }
  }

  if (!showDnsSetup) {
    return (
      <div className="site-domain-panel">
        <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="site-domain-icon">
          <circle cx="53" cy="54" r="43" stroke="currentColor" strokeWidth="4" />
          <path
            d="M10 54h82M53 11c15 13 23 28 23 43S68 84 53 97M53 11C38 24 30 39 30 54s8 30 23 43M53 11v86"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M89 62 110 99a7 7 0 0 1-6 10H62a7 7 0 0 1-6-10l21-37a7 7 0 0 1 12 0Z"
            fill="white"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M83 76v12m0 6v.5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <h3 className="page-title site-domain-title">Site not live yet</h3>
        <p className="page-subtitle site-domain-copy">
          Your clubsite needs a connected domain before it can go live.
          <br className="hidden sm:block" /> Once configured, customers will be able to access it.
        </p>

        <form
          onSubmit={(event) => void handleUpdateDomain(event)}
          className="site-domain-form"
        >
          <div className="site-domain-row">
            <InputField
              id="site-domain"
              type="text"
              value={domainInput}
              onChange={(event) => {
                setDomainInput(event.target.value);
                setDomainError("");
                setFormNotice("");
              }}
              placeholder="Enter your domain"
              disabled={isUpdating}
              aria-describedby={
                domainError ? "domain-error" : formNotice || notice ? "domain-notice" : undefined
              }
              labelClassName="input-heading"
            />
            <button type="submit" className="site-domain-submit" disabled={isUpdating}>
              {isUpdating ? "Updating…" : "Update domain"}
            </button>
          </div>
          {domainError ? (
            <p id="domain-error" role="alert" className="site-error">
              {domainError}
            </p>
          ) : null}
          {formNotice || notice ? (
            <p id="domain-notice" role="status" className="site-notice">
              {formNotice || notice}
            </p>
          ) : null}
          {connectedDomain ? (
            <p className="site-domain-meta">Current domain: {connectedDomain}</p>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="site-domain-layout">
      <header className="site-domain-layout-header">
        <div>
          <p className="site-dns-eyebrow">Domain</p>
          <h3 className="page-title site-domain-title">Domain settings</h3>
          <p className="page-subtitle site-domain-layout-copy">
            Manage your custom domain and DNS records for this clubsite.
          </p>
        </div>
      </header>

      <section className="site-domain-card" aria-labelledby="domain-card-title">
        <div className="site-domain-card-head">
          <div>
            <h4 id="domain-card-title" className="site-domain-card-title">
              Custom domain
            </h4>
            <p className="site-domain-card-desc">
              Current domain: <strong>{liveHostname}</strong>
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => void handleUpdateDomain(event)}
          className="site-domain-card-form"
        >
          <label htmlFor="site-domain-update" className="input-heading">
            Domain name
          </label>
          <div className="site-domain-row">
            <InputField
              id="site-domain-update"
              type="text"
              value={domainInput}
              onChange={(event) => {
                setDomainInput(event.target.value);
                setDomainError("");
                setFormNotice("");
              }}
              placeholder="yourclub.com"
              disabled={isUpdating}
              aria-describedby={
                domainError
                  ? "domain-error"
                  : formNotice || notice
                    ? "domain-notice"
                    : undefined
              }
              labelClassName="input-heading"
            />
            <button type="submit" className="site-domain-submit" disabled={isUpdating}>
              {isUpdating ? "Updating…" : "Update domain"}
            </button>
          </div>
          {domainError ? (
            <p id="domain-error" role="alert" className="site-error">
              {domainError}
            </p>
          ) : null}
          {formNotice ? (
            <p id="domain-notice" role="status" className="site-notice">
              {formNotice}
            </p>
          ) : null}
        </form>
      </section>

      <section className="site-domain-card" aria-labelledby="dns-card-title">
        <div className="site-domain-card-head">
          <div>
            <h4 id="dns-card-title" className="site-domain-card-title">
              DNS records
            </h4>
            <p className="site-domain-card-desc">
              Add these records at your domain provider for <strong>{liveHostname}</strong>.
              Propagation can take a few minutes to 48 hours.
            </p>
          </div>
        </div>

        <div className="site-domain-card-body">
          <SiteDnsRecordsTable
            records={dnsRecords}
            onCopyError={(message) => setDomainError(message)}
          />
        </div>
      </section>
    </div>
  );
}
