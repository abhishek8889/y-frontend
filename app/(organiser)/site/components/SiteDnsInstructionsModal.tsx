"use client";

import {
  formatDomainStatusLabel,
  type SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import { StatusBadge } from "@/components/common";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { Button } from "@/components/ui/Button";
import { SiteDnsRecordsTable } from "./SiteDnsRecordsTable";

export type SiteDnsInstructionsModalProps = {
  open: boolean;
  hostname?: string | null;
  status?: string | null;
  records: SiteDnsRecord[];
  /** Extra note under the subtitle (e.g. after publish). */
  notice?: string | null;
  primaryLabel?: string;
  onPrimary?: () => void;
  onClose: () => void;
};

function domainStatusBadgeProps(status: string | null | undefined) {
  const raw = String(status ?? "").trim().toLowerCase();
  if (raw === "pending_dns" || raw === "pending") {
    return { status: "pending", label: formatDomainStatusLabel(status) };
  }
  if (raw === "failed" || raw === "error") {
    return { status: "failed", label: formatDomainStatusLabel(status) };
  }
  if (raw === "verified" || raw === "active" || raw === "live") {
    return { status: "active", label: formatDomainStatusLabel(status) };
  }
  return { status: status || "draft", label: formatDomainStatusLabel(status) };
}

export function SiteDnsInstructionsModal({
  open,
  hostname,
  status,
  records,
  notice,
  primaryLabel,
  onPrimary,
  onClose,
}: SiteDnsInstructionsModalProps) {
  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="sites-dns-title"
      size="lg"
      panelClassName="sites-dns-modal-panel"
    >
      <div className="sites-dns-modal">
        <header className="sites-dns-modal-header">
          <p className="sites-dns-modal-eyebrow">DNS setup</p>
          <h2 id="sites-dns-title" className="page-title">
            DNS records
          </h2>
          <p className="page-subtitle">
            {hostname?.trim()
              ? `Add these records at your provider for ${hostname.trim()}.`
              : "DNS records for this site."}
          </p>
          {notice?.trim() ? (
            <p className="sites-dns-modal-notice">{notice.trim()}</p>
          ) : null}
          {status ? (
            <div className="sites-dns-modal-status">
              <StatusBadge
                {...domainStatusBadgeProps(status)}
                className="sites-card-status"
              />
            </div>
          ) : null}
        </header>
        <div className="sites-dns-modal-body">
          <SiteDnsRecordsTable records={records} />
        </div>
        <div className="sites-dns-modal-footer">
          <Button
            type="button"
            className="form-footer-btn form-footer-btn-secondary"
            onClick={onClose}
          >
            Close
          </Button>
          {primaryLabel && onPrimary ? (
            <Button
              type="button"
              className="form-footer-btn form-footer-btn-primary"
              onClick={onPrimary}
            >
              {primaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </OrganiserModal>
  );
}
