"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateCustomEventCategoryMutation,
  useCreateEventMutation,
  useGetEventCategoriesQuery,
  useGetEventDetailsQuery,
  useUpdateEventMutation,
  type EventLifecycleStatus,
} from "@/apis/events/eventsApi";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import { useGetVenuesForEventsQuery } from "@/apis/organisation/venuesApi";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { appToast } from "@/lib/ui/toast";
import {
  buildEventPayload,
  createEmptyEventFormValues,
  mapEventToFormValues,
  toEventLifecycleStatus,
  validateEventForm,
  type EventFormImage,
  type EventFormValues,
} from "./eventFormHelpers";

const sectionTabs = [
  { id: "event-details", label: "Event Details" },
  { id: "venue-space", label: "Venue & Space" },
  { id: "event-date-time", label: "Event Date & Time" },
];

const MAX_GALLERY_IMAGES = 4;

const CREATE_STATUS_OPTIONS: { value: EventLifecycleStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
];

const EDIT_STATUS_OPTIONS: { value: EventLifecycleStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

type EventFormProps = {
  mode: "create" | "edit";
  eventId?: string;
};

function FormSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-10 flex items-center justify-between border-b border-black/100 pb-1">
      <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">{title}</h2>
    </div>
  );
}

function UploadPlaceholder({ uploading }: { uploading?: boolean }) {
  return (
    <>
      <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-[4px] bg-black/5 text-black/60">
        <svg width="37px" height="37px" viewBox="0 0 1.11 1.11" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.139 1.018h0.833a0.046 0.046 0 0 0 0.046 -0.046v-0.185l-0.199 -0.199a0.046 0.046 0 0 0 -0.065 0L0.486 0.856a0.033 0.033 0 0 1 -0.046 -0.046L0.509 0.74l-0.106 -0.106a0.046 0.046 0 0 0 -0.065 0L0.092 0.879v0.092a0.046 0.046 0 0 0 0.046 0.046m0.833 0.092H0.139a0.139 0.139 0 0 1 -0.139 -0.139V0.139a0.139 0.139 0 0 1 0.139 -0.139h0.833a0.139 0.139 0 0 1 0.139 0.139v0.833a0.139 0.139 0 0 1 -0.139 0.139M0.301 0.416a0.116 0.116 0 1 0 0 -0.231 0.116 0.116 0 0 0 0 0.231"
            fill="#939393"
          />
        </svg>
      </div>
      <p className="text-[14px] font-bold leading-none text-black">
        {uploading ? "Uploading..." : "Drag and drop image file here"}
      </p>
      <p className="mt-[15px] text-center text-[12px] font-light uppercase leading-[16px] text-[#939393]">
        PNG, JPG, up to 10MB
      </p>
    </>
  );
}

export function EventForm({ mode, eventId }: EventFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [activeTab, setActiveTab] = useState(sectionTabs[0].id);
  const [values, setValues] = useState<EventFormValues>(createEmptyEventFormValues);
  const [hydratedEventId, setHydratedEventId] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const { data: categoriesData, isLoading: isLoadingCategories } = useGetEventCategoriesQuery();
  const { data: venuesForEventsData, isLoading: isLoadingVenues } = useGetVenuesForEventsQuery();
  const {
    data: eventDetailsData,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useGetEventDetailsQuery(eventId as string | number, {
    skip: !isEdit || eventId == null || eventId === "",
  });

  const [createCustomCategory, { isLoading: isCreatingCategory }] =
    useCreateCustomEventCategoryMutation();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const categories = categoriesData?.data ?? [];
  const venues = venuesForEventsData?.data ?? [];
  const isSaving = isCreating || isUpdating;
  const canSubmit =
    !isSaving && (!isEdit || (!isEventLoading && !isEventError && hydratedEventId != null));

  useEffect(() => {
    if (!isEdit || !eventDetailsData?.data) return;
    const idKey = String(eventDetailsData.data.id);
    if (hydratedEventId === idKey) return;
    setValues(mapEventToFormValues(eventDetailsData.data));
    setHydratedEventId(idKey);
  }, [eventDetailsData?.data, hydratedEventId, isEdit]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: isLoadingCategories ? "Loading categories..." : "Select Event Category" },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    ],
    [categories, isLoadingCategories],
  );

  const venueOptions = useMemo(
    () => [
      { value: "", label: isLoadingVenues ? "Loading venues..." : "Select venue" },
      ...venues.map((venue) => ({
        value: String(venue.id),
        label:
          venue.maximum_capacity != null
            ? `${venue.name} (Max capacity: ${venue.maximum_capacity})`
            : venue.name,
      })),
    ],
    [isLoadingVenues, venues],
  );

  function patchValues(patch: Partial<EventFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function handleVenueChange(nextVenueId: string) {
    const selectedVenue = venues.find((venue) => String(venue.id) === nextVenueId);
    patchValues({
      venue_id: nextVenueId,
      capacity:
        selectedVenue?.maximum_capacity != null ? String(selectedVenue.maximum_capacity) : values.capacity,
    });
  }

  async function handleCreateCustomCategory() {
    const name = customCategoryName.trim();
    if (!name) {
      appToast.error("Enter a category name.");
      return;
    }

    try {
      const result = await createCustomCategory({ name }).unwrap();
      patchValues({ event_category_id: String(result.data.id) });
      setCustomCategoryName("");
      setShowCustomCategory(false);
    } catch {
      // toast handled by mutation
    }
  }

  async function handleBannerFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const result = await uploadMedia({ file, context: "event-banner" }).unwrap();
      patchValues({
        banner: {
          path: result.data.path,
          url: result.data.url,
          alt_text: "banner",
        },
      });
    } catch {
      // toast handled by mutation
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleGalleryFiles(files: FileList | null) {
    if (!files?.length) return;

    const remaining = MAX_GALLERY_IMAGES - values.gallery.length;
    if (remaining <= 0) {
      appToast.error(`You can upload up to ${MAX_GALLERY_IMAGES} gallery images.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      appToast.warning(`Only ${MAX_GALLERY_IMAGES} gallery images are allowed. Extra files were skipped.`);
    }

    setUploadingGallery(true);
    try {
      const uploaded: EventFormImage[] = [];
      for (const file of selected) {
        const result = await uploadMedia({ file, context: "event-gallery" }).unwrap();
        uploaded.push({
          path: result.data.path,
          url: result.data.url,
          alt_text: "gallery",
        });
      }
      setValues((current) => ({
        ...current,
        gallery: [...current.gallery, ...uploaded].slice(0, MAX_GALLERY_IMAGES),
      }));
    } catch {
      // toast handled by mutation
    } finally {
      setUploadingGallery(false);
    }
  }

  async function submitForm() {
    if (!canSubmit) return;

    const validationError = validateEventForm(values);
    if (validationError) {
      appToast.error(validationError);
      return;
    }

    const payload = buildEventPayload(values);

    try {
      if (isEdit) {
        if (eventId == null || eventId === "") {
          appToast.error("Missing event id.");
          return;
        }
        await updateEvent({ eventId, body: payload }).unwrap();
      } else {
        await createEvent(payload).unwrap();
      }
      router.push("/events");
    } catch {
      // toast handled by mutation
    }
  }

  if (isEdit && !eventId) {
    return (
      <div className="rounded-[4px] border border-black/20 bg-black/5 px-4 py-6 text-[14px] text-black/70">
        Missing event id for edit mode.
      </div>
    );
  }

  if (isEdit && isEventLoading) {
    return (
      <div className="rounded-[4px] border border-black/20 bg-black/5 px-4 py-6 text-[14px] text-black/70">
        Loading event details...
      </div>
    );
  }

  if (isEdit && isEventError) {
    return (
      <div className="rounded-[4px] border border-black/20 bg-black/5 px-4 py-6 text-[14px] text-black/70">
        Unable to load event details.{" "}
        <button type="button" className="underline" onClick={() => router.push("/events")}>
          Back to events
        </button>
      </div>
    );
  }

  return (
    <div>
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
                  className={`inline-flex items-center border-b-[2px] px-4 py-[10px] text-[14px] font-bold uppercase leading-[20px] tracking-normal text-[#949494] transition ${
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

          <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr_0.9fr] xl:items-stretch">
            <div className="flex flex-col gap-4">
              <InputField
                label="Event Title"
                name="eventTitle"
                value={values.name}
                onChange={(event) => patchValues({ name: event.target.value })}
                placeholder="e.g. Keys Corner Comedy Night"
                containerClassName="rounded-[4px] border-black"
              />

              <div className="space-y-3">
                <SelectField
                  label="Event Category"
                  name="eventCategory"
                  value={values.event_category_id}
                  onChange={(event) => patchValues({ event_category_id: event.target.value })}
                  options={categoryOptions}
                  disabled={isLoadingCategories}
                  className="h-[46px] rounded-[4px] border-black text-[14px]"
                />

                {!showCustomCategory ? (
                  <Button
                    type="button"
                    onClick={() => setShowCustomCategory(true)}
                    className="h-[40px] w-full rounded-[4px] border border-black bg-white px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-black transition hover:bg-black/5 sm:w-auto"
                  >
                    + Create Custom Category
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 rounded-[4px] border border-black/20 bg-black/[0.02] p-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <InputField
                        label="Custom Category Name"
                        name="customCategoryName"
                        value={customCategoryName}
                        onChange={(event) => setCustomCategoryName(event.target.value)}
                        placeholder="e.g. Esports Night"
                        containerClassName="rounded-[4px] border-black"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleCreateCustomCategory();
                          }
                        }}
                      />
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        disabled={isCreatingCategory}
                        onClick={() => {
                          setShowCustomCategory(false);
                          setCustomCategoryName("");
                        }}
                        className="h-[48px] rounded-[4px] border border-black bg-white px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-black disabled:opacity-60"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={isCreatingCategory}
                        onClick={() => void handleCreateCustomCategory()}
                        className="h-[48px] rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white disabled:opacity-60"
                      >
                        {isCreatingCategory ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <InputField
                as="textarea"
                label="Event Description"
                name="eventDescription"
                rows={4}
                value={values.description}
                onChange={(event) => patchValues({ description: event.target.value })}
                placeholder="Provide a detailed description of the event, scheduled performances, lineup, and custom rules..."
                containerClassName="min-h-[140px] rounded-[4px] border-black"
              />
            </div>

            <div className="flex min-h-0 flex-col xl:h-full">
              <p className="mb-2 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                Featured Image / Video
              </p>
              <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white xl:min-h-0">
                {values.banner?.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={values.banner.url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove featured image"
                      onClick={() => patchValues({ banner: null })}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black shadow"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <label
                    htmlFor="event-featured-upload"
                    className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center px-4 text-center xl:min-h-0"
                  >
                    <input
                      id="event-featured-upload"
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(event) => {
                        void handleBannerFiles(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <UploadPlaceholder uploading={uploadingBanner} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col xl:h-full">
              <p className="mb-2 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                Add Multiple Event Images / Videos
              </p>
              <div className="flex min-h-[220px] flex-1 flex-col gap-2 xl:min-h-0">
                <label
                  htmlFor="event-gallery-upload"
                  className={[
                    "flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white px-3 text-center",
                    values.gallery.length > 0
                      ? "h-1/2 min-h-[110px] xl:min-h-0"
                      : "min-h-[220px] flex-1 xl:min-h-0",
                    values.gallery.length >= MAX_GALLERY_IMAGES ? "pointer-events-none opacity-50" : "",
                  ].join(" ")}
                >
                  <input
                    id="event-gallery-upload"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    multiple
                    disabled={values.gallery.length >= MAX_GALLERY_IMAGES || uploadingGallery}
                    onChange={(event) => {
                      void handleGalleryFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <UploadPlaceholder uploading={uploadingGallery} />
                </label>

                {values.gallery.length > 0 ? (
                  <div className="h-1/2 min-h-[110px] overflow-hidden xl:min-h-0">
                    <div className="flex h-full gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin]">
                      {values.gallery.map((image, index) => (
                        <div
                          key={`${image.path}-${index}`}
                          className="relative h-full w-[30%] min-w-[88px] shrink-0 overflow-hidden rounded-[4px] border border-black/20 bg-black/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            aria-label={`Remove gallery image ${index + 1}`}
                            onClick={() =>
                              setValues((current) => ({
                                ...current,
                                gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index),
                              }))
                            }
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[12px] leading-none text-black shadow"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="venue-space" className="scroll-mt-24">
          <FormSectionHeader title="02 / Venue & Event Capacity" />

          <div className="grid gap-6 md:grid-cols-2">
            <SelectField
              label="Select Venue"
              name="venue"
              value={values.venue_id}
              onChange={(event) => handleVenueChange(event.target.value)}
              options={venueOptions}
              disabled={isLoadingVenues}
              className="h-[46px] rounded-[4px] border-black text-[14px]"
            />

            <InputField
              label="Event Capacity (Maximum number of attendees for this event)"
              name="eventCapacity"
              value={values.capacity}
              onChange={(event) => patchValues({ capacity: event.target.value })}
              placeholder="Enter number"
              containerClassName="rounded-[4px] border-black"
            />
          </div>
        </section>

        <section id="event-date-time" className="scroll-mt-24">
          <FormSectionHeader title="03 / Event Date & Time" />

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Start Date & Time"
              name="startDateTime"
              type="datetime-local"
              value={values.starts_at_local}
              onChange={(event) => patchValues({ starts_at_local: event.target.value })}
            />

            <InputField
              label="End Date & Time"
              name="endDateTime"
              type="datetime-local"
              value={values.ends_at_local}
              onChange={(event) => patchValues({ ends_at_local: event.target.value })}
            />

            <div>
              <InputField
                label="Timezone"
                name="timezone"
                value={values.timezone}
                readOnly
                containerClassName="rounded-[4px] border-black bg-black/[0.02]"
              />
              <p className="mt-1 text-[12px] text-black/50">
                Detected from your local region. Times are entered locally and sent to the API as UTC.
              </p>
            </div>

            <SelectField
              label="Status"
              name="eventStatus"
              value={values.status}
              onChange={(event) =>
                patchValues({ status: toEventLifecycleStatus(event.target.value) })
              }
              options={isEdit ? EDIT_STATUS_OPTIONS : CREATE_STATUS_OPTIONS}
              className="h-[46px] rounded-[4px] border-black text-[14px]"
            />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-black/30 pt-4">
        <Button
          type="button"
          onClick={() => router.push("/events")}
          className="h-[42px] min-w-[120px] cursor-pointer rounded-[4px] border border-black bg-white px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submitForm()}
          className="h-[42px] min-w-[120px] cursor-pointer rounded-[4px] border border-black bg-black px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEdit ? "Save" : "Create"}
        </Button>
      </div>
    </div>
  );
}
