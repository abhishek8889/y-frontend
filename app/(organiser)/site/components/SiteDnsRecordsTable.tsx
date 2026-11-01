"use client";

import { useState } from "react";
import type { SiteDnsRecord } from "@/apis/organisation/siteApi";

type SiteDnsRecordsTableProps = {
  records: SiteDnsRecord[];
  onCopyError?: (message: string) => void;
};

const CopyIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M10.5 5.5V3.7A1.2 1.2 0 0 0 9.3 2.5H3.7A1.2 1.2 0 0 0 2.5 3.7v5.6a1.2 1.2 0 0 0 1.2 1.2h1.8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
    <path
      d="m3.5 8.5 3 3 6-7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function CopyIconButton({
  label,
  copied,
  onClick,
}: {
  label: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={copied ? "site-dns-copy-icon site-dns-copy-icon--done" : "site-dns-copy-icon"}
      onClick={onClick}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
    >
      {copied ? CheckIcon : CopyIcon}
    </button>
  );
}

export function SiteDnsRecordsTable({ records, onCopyError }: SiteDnsRecordsTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1600);
    } catch {
      onCopyError?.("Couldn’t copy to clipboard. Select and copy the value manually.");
    }
  }

  if (!records.length) {
    return (
      <p className="page-subtitle">
        No DNS records available yet. Connect a domain to generate them.
      </p>
    );
  }

  return (
    <div className="site-dns-table-wrap" role="region" aria-label="DNS records">
      <table className="site-dns-table">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Name / Host</th>
            <th scope="col">Value / Points to</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const rowKey = `${record.type}-${record.name}-${index}`;
            return (
              <tr key={rowKey}>
                <td>
                  <span className="site-dns-type">{record.type}</span>
                </td>
                <td>
                  <div className="site-dns-cell">
                    <code className="site-dns-code">{record.name}</code>
                    <CopyIconButton
                      label="Copy name"
                      copied={copiedKey === `${rowKey}-name`}
                      onClick={() => copyValue(`${rowKey}-name`, record.name)}
                    />
                  </div>
                </td>
                <td>
                  <div className="site-dns-cell">
                    <code className="site-dns-code">{record.value}</code>
                    <CopyIconButton
                      label="Copy value"
                      copied={copiedKey === `${rowKey}-value`}
                      onClick={() => copyValue(`${rowKey}-value`, record.value)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
