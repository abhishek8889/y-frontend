"use client";

import { useState, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

export default function DomainTab({
  connectedDomain,
  onConnected,
  notice,
}: {
  connectedDomain: string;
  onConnected: (domain: string) => void;
  notice: string;
}) {
  const [domainInput, setDomainInput] = useState(connectedDomain);
  const [domainError, setDomainError] = useState("");
  const [formNotice, setFormNotice] = useState("");

  function connectDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const domain = domainInput.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (!domain || !/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) {
      setDomainError("Enter a valid domain, such as www.yourclub.com.");
      setFormNotice("");
      return;
    }

    onConnected(domain);
    setDomainInput(domain);
    setDomainError("");
    setFormNotice(`Domain ${domain} saved. Complete your DNS setup to bring your site live.`);
  }

  return (
    <div className="site-domain-panel">
      <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="site-domain-icon">
        <circle cx="53" cy="54" r="43" stroke="currentColor" strokeWidth="4" />
        <path d="M10 54h82M53 11c15 13 23 28 23 43S68 84 53 97M53 11C38 24 30 39 30 54s8 30 23 43M53 11v86" stroke="currentColor" strokeWidth="4" />
        <path d="M89 62 110 99a7 7 0 0 1-6 10H62a7 7 0 0 1-6-10l21-37a7 7 0 0 1 12 0Z" fill="white" stroke="currentColor" strokeWidth="4" />
        <path d="M83 76v12m0 6v.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <h3 className="site-domain-title">Site not live yet</h3>
      <p className="site-domain-copy">
        Your site needs a connected domain before it can go live.
        <br className="hidden sm:block" /> Once configured, customers will be able to access it.
      </p>
      <form onSubmit={connectDomain} className="site-domain-form">
        <div className="site-domain-compose">
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
            aria-describedby={domainError ? "domain-error" : formNotice || notice ? "domain-notice" : undefined}
            labelClassName="input-heading"
          />
          <button type="submit" className="site-domain-submit">
            Connect domain
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
