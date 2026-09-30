"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

const sectionTabs = [
  { id: "basic-information", label: "Basic Information" },
  { id: "venue-address", label: "Venue Address" },
  { id: "contact-information", label: "Contact Information" },
  { id: "venue-capacity", label: "Venue Capacity" },
  { id: "facilities-accessibility", label: "Facilities & Accessibility" },
  { id: "detailed-logistics", label: "Detailed Logistics" },
  { id: "private-hire", label: "Private Hire" },
  { id: "venue-status", label: "Venue Status" },
];

export default function CreateVenuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("mode") === "edit";
  const [activeTab, setActiveTab] = useState(sectionTabs[0].id);

  return (
    <DashboardShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <div className="min-h-full bg-[#fff] p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-black/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/venues")}
              className="font-medium text-black/70 transition hover:text-black"
            >
              VENUES
            </button>
            <span>›</span>
            <span className="text-black">{isEditing ? "EDIT VENUE" : "CREATE VENUE"}</span>
          </div>
        </div>

        <h1 className="text-[32px] font-black uppercase leading-[1.1] tracking-[-0.06em] text-black">
          {isEditing ? "EDIT VENUE" : "CREATE NEW VENUE"}
        </h1>

        <div className="sticky top-0 z-20 mt-5 bg-white">
          <div className="overflow-hidden border-b border-black/30">
            <nav className="flex flex-wrap gap-5 md:gap-8">
              {sectionTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <a
                    key={tab.id}
                    href={`#${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center border-b-[2px] px-1 pb-3 pt-2 text-[12px] font-bold uppercase tracking-[0.12em] transition ${
                      isActive
                        ? "border-black text-black"
                        : "border-transparent text-black/60 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-10 pb-12 pt-8">
          <section id="basic-information" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[18px] font-black uppercase tracking-[-0.04em] text-black md:text-[22px]">
                01 / Basic Venue Information
              </h2>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.65fr_0.82fr_0.82fr] xl:items-stretch">
              <div className="space-y-5">
                <InputField
                  label="Venue Name"
                  name="venueName"
                  placeholder="e.g. Keys corners"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black mb-[20px]"
                />

                <SelectField
                  label="Venue Type"
                  name="venueType"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "Select venue type" },
                    { value: "stadium", label: "Stadium" },
                    { value: "ground", label: "Ground" },
                    { value: "clubhouse", label: "Clubhouse" },
                  ]}
                  className="h-[46px] rounded-[4px] border-black text-[14px] uppercase tracking-[0.12em]"
                />

                <InputField
                  as="textarea"
                  label="Venue Description"
                  rows={4}
                  placeholder="Enter an optional brief overview description of the venue and its historical significance..."
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div className="h-full">
                <label htmlFor="venue-banner-upload" className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                  Venue Banner / Videos
                </label>
                <label
                  htmlFor="venue-banner-upload"
                  className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white px-4 text-center"
                >
                  <input id="venue-banner-upload" type="file" accept="image/*,video/*" className="hidden" />
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[4px] bg-black/5 text-black/60">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 16.5L14 11.5L18 15.5V18.5H6V14.5L9 16.5ZM8.5 7.5C8.5 8.33 7.83 9 7 9C6.17 9 5.5 8.33 5.5 7.5C5.5 6.67 6.17 6 7 6C7.83 6 8.5 6.67 8.5 7.5Z" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium text-black/60">Drag and drop image file here</p>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.1em] text-black/45">
                    PNG, JPG, up to 10MB
                  </p>
                </label>
              </div>

              <div className="h-full">
                <label htmlFor="venue-gallery-upload" className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                  Add Gallery Images / Videos
                </label>
                <label
                  htmlFor="venue-gallery-upload"
                  className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white px-4 text-center"
                >
                  <input id="venue-gallery-upload" type="file" accept="image/*,video/*" className="hidden" multiple />
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[4px] bg-black/5 text-black/60">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 16.5L14 11.5L18 15.5V18.5H6V14.5L9 16.5ZM8.5 7.5C8.5 8.33 7.83 9 7 9C6.17 9 5.5 8.33 5.5 7.5C5.5 6.67 6.17 6 7 6C7.83 6 8.5 6.67 8.5 7.5Z" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium text-black/60">Drag and drop image file here</p>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.1em] text-black/45">
                    PNG, JPG, up to 10MB
                  </p>
                </label>
              </div>
            </div>
          </section>

          <section id="venue-address" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                02 / Address &amp; Location
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <InputField
                  label="Address Line 1"
                  name="addressLine1"
                  placeholder="e.g. Keys Park Road"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  label="Address Line 2"
                  name="addressLine2"
                  placeholder="e.g. Hednesford"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                  City / Town <span className="text-black">*</span>
                </label>
                <SelectField
                  name="cityTown"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "e.g. Cannock" },
                    { value: "cannock", label: "Cannock" },
                    { value: "wolverhampton", label: "Wolverhampton" },
                  ]}
                  className="h-[46px] rounded-[4px] border-black text-[14px] uppercase tracking-[0.12em]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                  County / State <span className="text-black">*</span>
                </label>
                <SelectField
                  name="countyState"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "e.g. Staffordshire" },
                    { value: "staffordshire", label: "Staffordshire" },
                    { value: "warwickshire", label: "Warwickshire" },
                  ]}
                  className="h-[46px] rounded-[4px] border-black text-[14px] uppercase tracking-[0.12em]"
                />
              </div>

              <div>
                <InputField
                  label="Postcode"
                  name="postcode"
                  placeholder="e.g. WS12 2DZ"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <SelectField
                  label="Country"
                  name="country"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "e.g. United Kingdom" },
                    { value: "uk", label: "United Kingdom" },
                    { value: "ireland", label: "Ireland" },
                  ]}
                  className="h-[46px] rounded-[4px] border-black text-[14px] uppercase tracking-[0.12em]"
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Google Map URL"
                  name="googleMapUrl"
                  placeholder="e.g. https://maps.app.goo.gl/Ah4kdZb3nvaF/TPA"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>
            </div>
          </section>

          <section id="contact-information" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                03 / Contact Information
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <InputField
                  label="Contact Name"
                  name="contactName"
                  placeholder="e.g. John Smith"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  label="Email Address"
                  name="emailAddress"
                  type="email"
                  placeholder="e.g. office@hednesfordtownfc.com"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  label="Phone"
                  name="phone"
                  placeholder="e.g. +44 1543 422870"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  label="Website"
                  name="website"
                  placeholder="e.g. www.website.com"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>
            </div>
          </section>

          <section id="venue-capacity" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                04 / Venue Capacity
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <InputField
                  label="Maximum Capacity"
                  name="maximumCapacity"
                  placeholder="e.g. 6039"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  label="Standing Capacity"
                  name="standingCapacity"
                  placeholder="e.g. 5000"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  label="Seated Capacity"
                  name="seatedCapacity"
                  placeholder="e.g. 1039"
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>
            </div>
          </section>

          <section id="facilities-accessibility" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                05 / Facilities &amp; Accessibility
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-[16px] font-bold uppercase tracking-[0.12em] text-black">Facilities Available</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    "Wi-Fi",
                    "Toilets",
                    "Audio / AV",
                    "Parking",
                    "Bar",
                    "Changing Facilities",
                    "Outdoor Area",
                    "Accessible Entrance",
                    "Accessible Toilets",
                    "Stage",
                    "Food & Drink",
                    "Catering",
                  ].map((facility) => (
                    <label key={facility} className="flex items-center gap-3 text-[15px] text-black">
                      <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" />
                      <span>{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-[16px] font-bold uppercase tracking-[0.12em] text-black">Accessibility Audit</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.12em] text-black">Accessible Entrance</p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="accessibleEntrance" defaultChecked className="h-4 w-4 accent-black" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="accessibleEntrance" className="h-4 w-4 accent-black" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.12em] text-black">Accessible Toilets</p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="accessibleToilets" defaultChecked className="h-4 w-4 accent-black" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="accessibleToilets" className="h-4 w-4 accent-black" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.12em] text-black">Wheelchair Access</p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="wheelchairAccess" defaultChecked className="h-4 w-4 accent-black" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="wheelchairAccess" className="h-4 w-4 accent-black" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="detailed-logistics" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                06 / Detailed Logistics
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <InputField
                  as="textarea"
                  label="Parking Information"
                  rows={4}
                  placeholder="Provide parking guidelines, spaces count, prices..."
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  as="textarea"
                  label="Public Transport Information"
                  rows={4}
                  placeholder="Bus routes, closest train stations..."
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <div>
                <InputField
                  as="textarea"
                  label="Travel Information"
                  rows={4}
                  placeholder="General driving routes, local landmarks..."
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>
            </div>
          </section>

          <section id="private-hire" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                07 / Private Hire Options
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black">Private Hire Available</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="privateHire" defaultChecked className="h-4 w-4 accent-black" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="privateHire" className="h-4 w-4 accent-black" />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black">Suitable For</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex items-center gap-3 text-[15px] text-black">
                    <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" defaultChecked />
                    <span>Parties</span>
                  </label>
                  <label className="flex items-center gap-3 text-[15px] text-black">
                    <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" defaultChecked />
                    <span>Corporate Events</span>
                  </label>
                  <label className="flex items-center gap-3 text-[15px] text-black">
                    <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" />
                    <span>Weddings</span>
                  </label>
                  <label className="flex items-center gap-3 text-[15px] text-black">
                    <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" defaultChecked />
                    <span>Meetings</span>
                  </label>
                  <label className="flex items-center gap-3 text-[15px] text-black">
                    <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" defaultChecked />
                    <span>Live Music</span>
                  </label>
                  <label className="flex items-center gap-3 text-[15px] text-black">
                    <input type="checkbox" className="h-4 w-4 rounded border-black accent-black" />
                    <span>Other</span>
                  </label>
                </div>
              </div>

              <div>
                <InputField
                  as="textarea"
                  label="Private Hire Description"
                  rows={4}
                  placeholder="Describe fees, hourly rates, catering terms..."
                  className="text-[16px] placeholder:text-black/45"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>
            </div>
          </section>

          <section id="venue-status" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
              <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
                08 / Venue Status
              </h2>
            </div>

            <div>
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black">Status <span className="text-black">*</span></p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="radio" name="venueStatus" defaultChecked className="h-4 w-4 accent-black" />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="venueStatus" className="h-4 w-4 accent-black" />
                  <span>Inactive</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/30 pt-4">
          <Button
            type="button"
            onClick={() => router.push("/venues")}
            className="h-[42px] min-w-[120px] rounded-[4px] border border-black bg-white px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-[42px] min-w-[120px] rounded-[4px] border border-black bg-[#f2f2f2] px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black"
          >
            Draft
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/venues")}
            className="h-[42px] min-w-[120px] rounded-[4px] border border-black bg-black px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Publish
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
