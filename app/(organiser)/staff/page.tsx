"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";

type StaffStatus = "Active" | "Invite Sent" | "Inactive" | "Removed";

type StaffMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  description?: string;
  photoName?: string;
  status: StaffStatus;
  joined: string;
  month: string;
};

const initialMembers: StaffMember[] = [
  { id: 1, name: "John Smith", email: "john.smith@htfc.co.uk", role: "Event Manager", status: "Active", joined: "12 Jan 2024", month: "2026-06" },
  { id: 2, name: "Sarah Wilson", email: "john.smith@htfc.co.uk", role: "Event Manager", status: "Invite Sent", joined: "Invite Sent", month: "2026-06" },
  { id: 3, name: "John Smith", email: "john.smith@htfc.co.uk", role: "Event Manager", status: "Inactive", joined: "12 Jan 2024", month: "2026-06" },
  { id: 4, name: "John Smith", email: "john.smith@htfc.co.uk", role: "Event Manager", status: "Removed", joined: "12 Jan 2024", month: "2026-06" },
  { id: 5, name: "John Smith", email: "john.smith@htfc.co.uk", role: "Event Manager", status: "Active", joined: "12 Jan 2024", month: "2026-06" },
];

const roles = ["Organisation admin", "Event Manager", "Venue Manager"];
const defaultInviteRoles = ["Event Manager", "Venue Manager"];

function statusColor(status: StaffStatus) {
  if (status === "Active") return "text-[#2dbb5a]";
  if (status === "Inactive") return "text-[#ef4343]";
  if (status === "Removed") return "text-[#f08332]";
  return "text-[#777]";
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function StaffPage() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("2026-06");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsMember, setDetailsMember] = useState<StaffMember | null>(null);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(defaultInviteRoles);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [invitationEmail, setInvitationEmail] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) =>
      (!query || `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(query))
      && (statusFilter === "all" || member.status.toLowerCase().replace(" ", "-") === statusFilter)
      && (!month || member.month === month),
    );
  }, [members, search, statusFilter, month]);

  function openInviteDialog() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setDescription("");
    setSelectedRoles([...defaultInviteRoles]);
    setPhotoName("");
    setPhotoError("");
    setRolePickerOpen(false);
    setDialogOpen(true);
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const memberName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const memberEmail = email.trim();
    if (!memberName || !memberEmail || selectedRoles.length === 0) return;

    setMembers((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((member) => member.id)) + 1,
        name: memberName,
        email: memberEmail,
        role: selectedRoles.join(", "),
        phone: phone.trim(),
        description: description.trim(),
        photoName,
        status: "Invite Sent",
        joined: "Invite Sent",
        month: "2026-10",
      },
    ]);
    setDialogOpen(false);
    setMonth("2026-10");
    setInvitationEmail(memberEmail);
    setInvitationSent(true);
  }

  function toggleInviteRole(roleName: string) {
    setSelectedRoles((current) => current.includes(roleName)
      ? current.filter((selected) => selected !== roleName)
      : [...current, roleName]);
  }

  function selectPhoto(file: File | undefined) {
    if (!file) {
      setPhotoName("");
      setPhotoError("");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhotoName("");
      setPhotoError("Choose a JPG or PNG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoName("");
      setPhotoError("Photo must be 2 MB or smaller.");
      return;
    }
    setPhotoName(file.name);
    setPhotoError("");
  }

  function toggleInactive(memberId: number) {
    setMembers((current) => current.map((member) =>
      member.id === memberId
        ? { ...member, status: member.status === "Inactive" ? "Active" : "Inactive" }
        : member,
    ));
    setOpenActionsId(null);
  }

  function removeMember(memberId: number) {
    setMembers((current) => current.map((member) =>
      member.id === memberId ? { ...member, status: "Removed" } : member,
    ));
    setOpenActionsId(null);
  }

  return (
    <DashboardShell header={<DashboardHeader userName="MARVIN" />} sidebar={<DashboardSidebar />}>
      <main className="min-h-full bg-white px-4 py-5 md:px-5 md:py-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-black uppercase leading-6 text-black">Staff</h1>
            <p className="mt-1 text-[13px] leading-5 text-[#777]">
              Invite and manage staff members. Assign roles to control what they can access and do.
            </p>
          </div>
          <button
            type="button"
            onClick={openInviteDialog}
            className="inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[3px] border border-black bg-black px-3 text-[11px] font-bold uppercase text-white transition hover:bg-white hover:text-black"
          >
            <span aria-hidden="true" className="text-[15px] leading-none">+</span>
            Add staff member
          </button>
        </header>

        <section className="mt-5" aria-label="Staff members">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <label className="flex h-[34px] min-w-0 flex-1 items-center gap-2 border-b border-black/55 px-2 text-black/60 focus-within:border-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                aria-label="Search staff by name, email or role"
                className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-black placeholder:text-[#888] focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="staff-status-filter">Staff status</label>
              <select
                id="staff-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-[34px] min-w-[120px] border border-black/65 bg-white px-2 text-[10px] font-bold uppercase text-black"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="invite-sent">Invite sent</option>
                <option value="inactive">Inactive</option>
                <option value="removed">Removed</option>
              </select>
              <label className="sr-only" htmlFor="staff-month-filter">Month joined</label>
              <input
                id="staff-month-filter"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Filter staff by month joined or invited"
                className="h-[34px] min-w-[120px] border border-black/65 bg-white px-2 text-[10px] font-bold uppercase text-black"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-y border-black/65 text-[10px] font-bold uppercase text-black">
                  <th className="px-2.5 py-3">Name</th>
                  <th className="px-2.5 py-3">Email</th>
                  <th className="px-2.5 py-3">Role assigned</th>
                  <th className="px-2.5 py-3">Status</th>
                  <th className="px-2.5 py-3">Joined</th>
                  <th className="px-2.5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-black/55 text-[12px] text-black">
                    <td className="whitespace-nowrap px-2.5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-[9px] font-bold text-[#3f4754]"
                        >
                          {initials(member.name)}
                        </span>
                        <span>{member.name}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">{member.email}</td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">{member.role}</td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">
                      {member.status === "Invite Sent" ? (
                        <span aria-label="Invite sent">-</span>
                      ) : (
                        <span className={`font-bold ${statusColor(member.status)}`}>
                          <span aria-hidden="true">● </span>{member.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-3.5">{member.joined}</td>
                    <td className="px-2.5 py-3 text-center">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          aria-label={`Actions for ${member.name}`}
                          aria-expanded={openActionsId === member.id}
                          onClick={() => setOpenActionsId((current) => current === member.id ? null : member.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.035] text-[18px] leading-none text-black/75 hover:bg-black/10"
                        >
                          ⋮
                        </button>
                        {openActionsId === member.id ? (
                          <div className="absolute right-0 top-8 z-10 min-w-[190px] border border-black/60 bg-white p-1 text-left shadow-md">
                            <button
                              type="button"
                              onClick={() => {
                                setDetailsMember(member);
                                setOpenActionsId(null);
                              }}
                              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-black/5"
                            >
                              <span aria-hidden="true">◉</span> View details
                            </button>
                            {member.status !== "Removed" && member.status !== "Invite Sent" ? (
                              <button
                                type="button"
                                onClick={() => toggleInactive(member.id)}
                                className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-black/5"
                              >
                                <span aria-hidden="true">◌</span>
                                {member.status === "Inactive" ? "Reactivate member" : "Temporary inactive"}
                              </button>
                            ) : null}
                            {member.status !== "Removed" ? (
                              <button
                                type="button"
                                onClick={() => removeMember(member.id)}
                                className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-black/5"
                              >
                                <span aria-hidden="true">⊗</span> Remove member
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-[12px] text-black/55">
                      No staff members match your search or filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {dialogOpen ? (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setDialogOpen(false);
            }}
          >
            <form
              role="dialog"
              aria-modal="true"
              aria-labelledby="staff-dialog-title"
              onSubmit={addMember}
              className="flex max-h-full w-full max-w-[580px] flex-col border border-black/60 bg-white shadow-xl"
            >
              <div className="flex shrink-0 items-center gap-2.5 border-b border-black/50 px-4 py-3.5">
                <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-[3px] bg-black" />
                <div className="min-w-0 flex-1">
                  <h2 id="staff-dialog-title" className="text-[14px] font-black uppercase">Add staff member</h2>
                </div>
                <button type="button" onClick={() => setDialogOpen(false)} aria-label="Close dialog" className="h-7 w-7 text-[17px]">×</button>
              </div>
              <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <label className="block text-[10px] font-bold uppercase" htmlFor="staff-first-name">
                    First name *
                    <input
                      id="staff-first-name"
                      autoFocus
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Enter first name"
                      className="mt-1 h-9 w-full rounded-[3px] border border-black/60 px-3 text-[12px] font-normal normal-case placeholder:text-[#888]"
                    />
                  </label>
                  <label className="block text-[10px] font-bold uppercase" htmlFor="staff-last-name">
                    Last name *
                    <input
                      id="staff-last-name"
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Enter last name"
                      className="mt-1 h-9 w-full rounded-[3px] border border-black/60 px-3 text-[12px] font-normal normal-case placeholder:text-[#888]"
                    />
                  </label>
                  <label className="block text-[10px] font-bold uppercase" htmlFor="staff-email">
                    Email address *
                    <input
                      id="staff-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter email"
                      className="mt-1 h-9 w-full rounded-[3px] border border-black/60 px-3 text-[12px] font-normal normal-case placeholder:text-[#888]"
                    />
                  </label>
                  <label className="block text-[10px] font-bold uppercase" htmlFor="staff-phone">
                    Phone number
                    <input
                      id="staff-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="mt-1 h-9 w-full rounded-[3px] border border-black/60 px-3 text-[12px] font-normal normal-case"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase" htmlFor="staff-role-picker">
                    Assign role(s) *
                  </label>
                  <p className="mt-1 text-[11px] text-[#737b8c]">Select one or more roles for this staff member.</p>
                  <div className="relative mt-1">
                    <button
                      id="staff-role-picker"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={rolePickerOpen}
                      onClick={() => setRolePickerOpen((open) => !open)}
                      className="flex h-9 w-full items-center justify-between rounded-[3px] border border-black/60 px-3 text-left text-[12px] text-[#555]"
                    >
                      Select role
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${rolePickerOpen ? "rotate-180" : ""}`}>
                        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {rolePickerOpen ? (
                      <div role="listbox" aria-label="Available roles" aria-multiselectable="true" className="absolute inset-x-0 top-10 z-20 border border-black/60 bg-white p-1 shadow-md">
                        {roles.map((roleOption) => (
                          <label key={roleOption} className="flex cursor-pointer items-center gap-2 px-2 py-2 text-[12px] hover:bg-black/5">
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(roleOption)}
                              onChange={() => toggleInviteRole(roleOption)}
                              className="h-[13px] w-[13px] accent-black"
                            />
                            {roleOption}
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRoles.map((selectedRole) => (
                      <span key={selectedRole} className="inline-flex items-center gap-2 rounded-[4px] bg-[#eee] px-2.5 py-1.5 text-[11px]">
                        {selectedRole}
                        <button type="button" onClick={() => toggleInviteRole(selectedRole)} aria-label={`Remove ${selectedRole}`} className="font-bold leading-none">×</button>
                      </span>
                    ))}
                  </div>
                  {selectedRoles.length === 0 ? <p role="alert" className="mt-1 text-[11px] text-red-600">Select at least one role.</p> : null}
                </div>

                <div>
                  <p className="text-[10px] font-bold">Photo (Optional)</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee] text-[15px] text-[#999]">▧</span>
                    <div>
                      <label className="inline-flex h-7 cursor-pointer items-center rounded-[3px] border border-black/60 px-3 text-[11px] hover:bg-black/5">
                        Add Photo
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="sr-only"
                          onChange={(event) => selectPhoto(event.target.files?.[0])}
                        />
                      </label>
                      <p className="mt-1 text-[10px] text-[#888]">{photoError || photoName || "JPG, PNG (Max 2MB)"}</p>
                    </div>
                  </div>
                </div>

                <label className="block text-[10px] font-bold uppercase" htmlFor="staff-description">
                  Description
                  <textarea
                    id="staff-description"
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Provide a short brief..."
                    className="mt-1 min-h-[74px] w-full resize-y rounded-[3px] border border-black/60 px-3 py-2 text-[12px] font-normal normal-case placeholder:text-[#888]"
                  />
                </label>
              </div>
              <div className="flex shrink-0 gap-2 border-t border-black/50 px-4 py-3">
                <button type="button" onClick={() => setDialogOpen(false)} className="h-9 flex-1 rounded-[3px] border border-black/60 text-[10px] uppercase hover:bg-black/5">Cancel</button>
                <button type="submit" disabled={selectedRoles.length === 0 || Boolean(photoError)} className="h-9 flex-1 rounded-[3px] border border-black bg-black text-[10px] uppercase text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50">Send invitation</button>
              </div>
            </form>
          </div>
        ) : null}

        {invitationSent ? (
          <div
            role="presentation"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setInvitationSent(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="invitation-sent-title"
              className="relative w-full max-w-[450px] rounded-[4px] bg-white px-7 py-8 text-center shadow-xl sm:px-10"
            >
              <button
                type="button"
                onClick={() => setInvitationSent(false)}
                aria-label="Close invitation confirmation"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded border border-black/10 text-[16px] text-black/70 hover:bg-black/5"
              >
                ×
              </button>
              <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="mx-auto h-[76px] w-[76px] text-black">
                <circle cx="38" cy="42" r="28" stroke="currentColor" strokeWidth="5" strokeDasharray="145 40" transform="rotate(-42 38 42)" />
                <path d="m24 41 10 10 24-25" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 id="invitation-sent-title" className="mt-4 text-[19px] font-black uppercase">Invitation sent</h2>
              <p className="mt-4 text-[14px] leading-5 text-black">
                An invitation email has been sent to<br />
                <strong className="font-bold">{invitationEmail}</strong>. They can now join your organisation.
              </p>
              <button
                type="button"
                onClick={() => setInvitationSent(false)}
                className="mt-8 h-12 w-full rounded-[3px] border border-black bg-black text-[12px] uppercase text-white transition hover:bg-white hover:text-black"
              >
                Okay
              </button>
            </section>
          </div>
        ) : null}

        {detailsMember ? (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setDetailsMember(null);
            }}
          >
            <section role="dialog" aria-modal="true" aria-labelledby="staff-details-title" className="w-full max-w-[420px] border border-black/60 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-black/50 px-4 py-3">
                <h2 id="staff-details-title" className="text-[13px] font-black uppercase">Staff member details</h2>
                <button type="button" onClick={() => setDetailsMember(null)} aria-label="Close details" className="h-7 w-7 text-[17px]">×</button>
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 px-4 py-4 text-[12px]">
                <dt className="font-bold text-black/60">Name</dt><dd>{detailsMember.name}</dd>
                <dt className="font-bold text-black/60">Email</dt><dd>{detailsMember.email}</dd>
                <dt className="font-bold text-black/60">Role</dt><dd>{detailsMember.role}</dd>
                {detailsMember.phone ? <><dt className="font-bold text-black/60">Phone</dt><dd>{detailsMember.phone}</dd></> : null}
                {detailsMember.description ? <><dt className="font-bold text-black/60">Description</dt><dd>{detailsMember.description}</dd></> : null}
                {detailsMember.photoName ? <><dt className="font-bold text-black/60">Photo</dt><dd>{detailsMember.photoName}</dd></> : null}
                <dt className="font-bold text-black/60">Status</dt><dd>{detailsMember.status}</dd>
                <dt className="font-bold text-black/60">Joined</dt><dd>{detailsMember.joined}</dd>
              </dl>
              <div className="border-t border-black/50 px-4 py-3 text-right">
                <button type="button" onClick={() => setDetailsMember(null)} className="h-8 border border-black/60 px-5 text-[10px] uppercase hover:bg-black/5">Close</button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </DashboardShell>
  );
}
