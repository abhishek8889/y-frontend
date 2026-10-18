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
    setFormNotice(`Domain ${domain} saved. Complete your DNS setup to bring your clubsite live.`);
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col items-center justify-center px-3 pb-10">
      <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-[112px] w-[112px] text-[#d4d4d4]">
        <circle cx="53" cy="54" r="43" stroke="currentColor" strokeWidth="4" />
        <path d="M10 54h82M53 11c15 13 23 28 23 43S68 84 53 97M53 11C38 24 30 39 30 54s8 30 23 43M53 11v86" stroke="currentColor" strokeWidth="4" />
        <path d="M89 62 110 99a7 7 0 0 1-6 10H62a7 7 0 0 1-6-10l21-37a7 7 0 0 1 12 0Z" fill="white" stroke="currentColor" strokeWidth="4" />
        <path d="M83 76v12m0 6v.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <h3 className="mt-8 text-[22px] font-black uppercase text-black">Clubsite not live yet</h3>
      <p className="mt-5 max-w-[440px] text-center text-[14px] leading-[20px] text-[#666666]">
        Your clubsite needs a connected domain before it can go live.
        <br className="hidden sm:block" /> Once configured, customers will be able to access it.
      </p>
      <form onSubmit={connectDomain} className="mt-6 w-full max-w-[600px]">
        <div className="flex h-[40px] justify-between items-center gap-1 rounded-[6px] border border-black/80 p-[4px]">
          <InputField
            id="clubsite-domain"
            type="text"
            value={domainInput}
            onChange={(event) => {
              setDomainInput(event.target.value);
              setDomainError("");
              setFormNotice("");
            }}
            placeholder="Enter your domain"
            aria-describedby={domainError ? "domain-error" : formNotice || notice ? "domain-notice" : undefined}
            containerClassName="!h-full !min-w-0 !flex-1 !rounded-none !border-0 focus-within:!ring-0"
            className="!px-[10px] !text-[14px] !leading-6 !text-black placeholder:!text-black"
          />
          <button
            type="submit"
            className="h-full w-[228px] max-w-[40%] shrink-0 rounded-[4px] border border-black bg-black text-[14px] uppercase leading-6 text-white transition hover:bg-white hover:text-black"
          >
            Connect domain
          </button>
        </div>
        {domainError ? <p id="domain-error" role="alert" className="mt-2 text-[11px] text-red-600">{domainError}</p> : null}
        {formNotice || notice ? <p id="domain-notice" role="status" className="mt-2 text-[11px] text-[#666]">{formNotice || notice}</p> : null}
        {connectedDomain ? <p className="mt-2 text-[10px] text-[#777]">Current domain: {connectedDomain}</p> : null}
      </form>
    </div>
  );
}
