"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { savePublishedEvent } from "@/app/events/eventStorage";

const sectionTabs = [
  { id: "event-details", label: "Event Details" },
  { id: "venue-space", label: "Venue & Space" },
  { id: "event-date-time", label: "Event Date & Time" },
];

type UploadCardProps = {
  label: string;
  id: string;
  multiple?: boolean;
};

function UploadCard({ label, id, multiple = false }: UploadCardProps) {
  return (
    <div className="h-full">
      <label htmlFor={id} className="mb-2 block text-[14px] font-bold uppercase text-black">
        {label}
      </label>

      <label
        htmlFor={id}
        className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white px-4 text-center"
      >
        <input id={id} type="file" accept="image/*,video/*" multiple={multiple} className="hidden" />

        <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-black/5 text-black/60">
          <svg width="37px" height="37px" viewBox="0 0 1.11 1.11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.139 1.018h0.833a0.046 0.046 0 0 0 0.046 -0.046v-0.185l-0.199 -0.199a0.046 0.046 0 0 0 -0.065 0L0.486 0.856a0.033 0.033 0 0 1 -0.046 -0.046L0.509 0.74l-0.106 -0.106a0.046 0.046 0 0 0 -0.065 0L0.092 0.879v0.092a0.046 0.046 0 0 0 0.046 0.046m0.833 0.092H0.139a0.139 0.139 0 0 1 -0.139 -0.139V0.139a0.139 0.139 0 0 1 0.139 -0.139h0.833a0.139 0.139 0 0 1 0.139 0.139v0.833a0.139 0.139 0 0 1 -0.139 0.139M0.301 0.416a0.116 0.116 0 1 0 0 -0.231 0.116 0.116 0 0 0 0 0.231" fill="#939393"/></svg>
        </div>

        <p className="mt-[20px] mb-[15px] text-black/100 font-bold text-[14px] leading-none tracking-normal">Drag and drop image file here</p>
        <p className="font-light text-[12px] leading-[16px] tracking-normal text-center text-[#939393] uppercase">
          PNG, JPG, up to 10MB
        </p>
      </label>
    </div>
  );
}

function FormSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-10 flex items-center justify-between border-b border-black/100 pb-1">
      <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
        {title}
      </h2>
    </div>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(sectionTabs[0].id);

  function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const categoryLabels: Record<string, string> = {
      all: "Not selected",
      comedy: "Comedy",
      music: "Music",
      sports: "Sports",
      festival: "Festival",
    };
    const venueLabels: Record<string, string> = {
      all: "Not selected",
      "keys-corner": "Keys Corner",
      "stadium-east": "Stadium East",
      clubhouse: "Clubhouse",
    };
    const timezoneLabels: Record<string, string> = {
      all: "Not selected",
      gmt: "GMT",
      bst: "BST",
      est: "EST",
    };
    const getValue = (name: string) => String(formData.get(name) ?? "").trim();
    const category = getValue("eventCategory");
    const venue = getValue("venue");
    const timezone = getValue("timezone");

    savePublishedEvent({
      id: crypto.randomUUID(),
      title: getValue("eventTitle") || "Untitled Event",
      category: categoryLabels[category] ?? category,
      description: getValue("eventDescription"),
      venue: venueLabels[venue] ?? venue,
      capacity: getValue("eventCapacity"),
      startDateTime: getValue("startDateTime"),
      endDateTime: getValue("endDateTime"),
      timezone: timezoneLabels[timezone] ?? timezone,
    });

    router.push("/events");
  }

  return (
    <DashboardShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <div className="min-h-full bg-white p-5 md:p-6">
        <form onSubmit={handlePublish}>
        <div className="mb-3 flex items-center justify-between gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-black/70">
          <div className="flex items-center gap-2 font-['Univers'] font-normal text-[12px] leading-none tracking-normal uppercase text-[#666666]">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="font-medium text-black/70 transition hover:text-black"
            >
              EVENTS
            </button>
            <span>›</span>
            <span className="text-black">CREATE EVENT</span>
          </div>
        </div>

        <h1 className="font-bold text-[26px] leading-none tracking-normal uppercase text-black">
          CREATE NEW EVENT
        </h1>

        <div className="sticky top-0 z-20 mt-[27px] bg-white">
          <div className="overflow-hidden border-b border-black/30">
            <nav className="flex flex-wrap gap-5 md:gap-8">
              {sectionTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <a
                    key={tab.id}
                    href={`#${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center border-b-[2px] px-4 py-[10px] font-bold text-[14px] leading-[20px] tracking-normal uppercase text-[#949494] transition ${
                      isActive ? "border-black text-black" : "border-transparent hover:text-black"
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
          <section id="event-details" className="scroll-mt-24">
            <FormSectionHeader title="01 / Event Details" />

            <div className="grid gap-6 xl:grid-cols-[1.65fr_0.82fr_0.82fr] xl:items-stretch">
              <div className="space-y-5">
                <InputField
                  label="Event Title"
                  name="eventTitle"
                  placeholder="e.g. Keys Corner Comedy Night"
                  containerClassName="rounded-[4px] border-black mb-[20px]"
                />

                <SelectField
                  label="Event Category"
                  name="eventCategory"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "Select Event Type" },
                    { value: "comedy", label: "Comedy" },
                    { value: "music", label: "Music" },
                    { value: "sports", label: "Sports" },
                    { value: "festival", label: "Festival" },
                  ]}
                />

                <InputField
                  as="textarea"
                  label="Event Description"
                  name="eventDescription"
                  rows={4}
                  placeholder="Provide a detailed description of the event, scheduled performances, lineup, and custom rules..."
                  containerClassName="rounded-[4px] border-black"
                />
              </div>

              <UploadCard label="Featured Image / Video" id="event-featured-upload" />
              <UploadCard label="Add Multiple Event Images / Videos" id="event-gallery-upload" multiple />
            </div>
          </section>

          <section id="venue-space" className="scroll-mt-24">
            <FormSectionHeader title="02 / Venue & Event Capacity" />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <SelectField
                  label="Select Venue"
                  name="venue"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "Select venue" },
                    { value: "keys-corner", label: "Keys Corner" },
                    { value: "stadium-east", label: "Stadium East" },
                    { value: "clubhouse", label: "Clubhouse" },
                  ]}
                />
              </div>

              <div>
                <InputField
                  label="Event Capacity (Maximum number of attendees for this event)"
                  name="eventCapacity"
                  placeholder="Enter number"
                  containerClassName="rounded-[4px] border-black"
                />
              </div>
            </div>
          </section>

          <section id="event-date-time" className="scroll-mt-24">
            <FormSectionHeader title="03 / Event Date & Time" />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <InputField
                  label="Start Date & Time"
                  name="startDateTime"
                  type="datetime-local"
                />
              </div>

              <div>
                <InputField
                  label="End Date & Time"
                  name="endDateTime"
                  type="datetime-local"
                />
              </div>

              <div className="md:col-span-2">
                <SelectField
                  label="Timezone"
                  name="timezone"
                  defaultValue="all"
                  options={[
                    { value: "all", label: "Select time zone" },
                    { value: "gmt", label: "GMT" },
                    { value: "bst", label: "BST" },
                    { value: "est", label: "EST" },
                  ]}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/30 pt-4">
          <Button
            type="button"
            onClick={() => router.push("/events")}
            className="cursor-pointer h-[42px] min-w-[120px] rounded-[4px] border border-black bg-white px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer h-[42px] min-w-[120px] rounded-[4px] border border-black bg-[#f2f2f2] px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black"
          >
            Draft
          </Button>
          <Button
            type="submit"
            className="cursor-pointer h-[42px] min-w-[120px] rounded-[4px] border border-black bg-black px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Publish
          </Button>
        </div>
        </form>
      </div>
    </DashboardShell>
  );
}
