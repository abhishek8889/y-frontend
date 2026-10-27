"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import {
  useCreateVenueMutation,
  useGetVenueDetailsQuery,
  useGetVenueFacilitiesQuery,
  useGetVenueSuitableForOptionsQuery,
  useGetVenueTypesQuery,
  useUpdateVenueMutation,
} from "@/apis/organisation/venuesApi";
import { RichTextEditor } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { appToast } from "@/lib/ui/toast";
import { FormSectionTabs } from "@/components/organiser/FormSectionTabs";
import { SelectFacilitiesDrawer } from "@/components/organiser/venues/SelectFacilitiesDrawer";
import { SelectSuitableForDrawer } from "@/components/organiser/venues/SelectSuitableForDrawer";
import {
  buildVenuePayload,
  createEmptyVenueFormValues,
  isVenueVideoMedia,
  mapVenueToFormValues,
  validateVenueForm,
  type VenueFormImage,
  type VenueFormValues,
} from "@/components/organiser/venues/venueFormHelpers";

/** Sticky nav tabs (Figma). Venue Status is a form section only — not in the tab strip. */
const sectionTabs = [
  { id: "basic-information", label: "Basic information" },
  { id: "venue-address", label: "Venue address" },
  { id: "contact-information", label: "Contact information" },
  { id: "venue-capacity", label: "Venue Capacity" },
  { id: "facilities-accessibility", label: "Facilities & Accessibility" },
  { id: "detailed-logistics", label: "Detailed Logistics" },
  { id: "private-hire", label: "Private Hire" },
];

/** Match sticky tab strip height so hash/scroll landing does not leave previous fields visible. */
const SECTION_SCROLL_MT = "scroll-mt-[44px]";

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="section-heading">
      <h2 className="section-title">{children}</h2>
    </div>
  );
}

function findFormScrollContainer(from: HTMLElement | null) {
  let node: HTMLElement | null = from;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export type VenueFormProps = {
  mode: "create" | "edit";
  venueId?: string | number;
};

function YesNoRadios({
  name,
  value,
  onChange,
}: {
  name: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 sm:gap-x-[50px]">
      <label className="flex items-center gap-2 text-[14px] font-normal text-black">
        <input
          type="radio"
          name={name}
          checked={value}
          onChange={() => onChange(true)}
          className="h-4 w-4 accent-black"
        />
        <span>Yes</span>
      </label>
      <label className="flex items-center gap-2 text-[14px] font-normal text-black">
        <input
          type="radio"
          name={name}
          checked={!value}
          onChange={() => onChange(false)}
          className="h-4 w-4 accent-black"
        />
        <span>No</span>
      </label>
    </div>
  );
}

const MAX_GALLERY_IMAGES = 4;

function UploadPlaceholder({ uploading }: { uploading?: boolean }) {
  return (
    <>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-black/55">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M8 10l4-4 4 4M12 6.5V16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="input-heading mb-0 text-center">
        {uploading ? "Uploading..." : "Drag and drop image or video here"}
      </p>
      <p className="form-upload-hint">PNG, JPG, MP4, MOV up to 10MB</p>
    </>
  );
}

function VenueMediaPreview({
  media,
  className = "",
}: {
  media: VenueFormImage;
  className?: string;
}) {
  if (isVenueVideoMedia(media)) {
    return (
      <video
        src={media.url}
        className={className}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt="" className={className} />
  );
}

export function VenueForm({ mode, venueId }: VenueFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [activeTab, setActiveTab] = useState(sectionTabs[0].id);
  const [values, setValues] = useState<VenueFormValues>(createEmptyVenueFormValues);
  const [hydratedVenueId, setHydratedVenueId] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isFacilitiesDrawerOpen, setIsFacilitiesDrawerOpen] = useState(false);
  const [isSuitableForDrawerOpen, setIsSuitableForDrawerOpen] = useState(false);
  const tabsBarRef = useRef<HTMLDivElement>(null);

  function scrollToSection(sectionId: string) {
    setActiveTab(sectionId);
    const section = document.getElementById(sectionId);
    if (!section) return;

    const scroller = findFormScrollContainer(section);
    const tabsHeight = tabsBarRef.current?.offsetHeight ?? 44;

    if (!scroller) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const nextTop =
      scroller.scrollTop +
      (section.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
      tabsHeight;

    scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  }

  const { data: venueTypesData } = useGetVenueTypesQuery();
  const { data: facilitiesData } = useGetVenueFacilitiesQuery();
  const { data: suitableForData } = useGetVenueSuitableForOptionsQuery();
  const {
    data: venueDetailsData,
    isLoading: isVenueLoading,
    isError: isVenueError,
  } = useGetVenueDetailsQuery(venueId as string | number, {
    skip: !isEdit || venueId == null || venueId === "",
  });

  const [createVenue, { isLoading: isCreating }] = useCreateVenueMutation();
  const [updateVenue, { isLoading: isUpdating }] = useUpdateVenueMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const venueTypes = venueTypesData?.data ?? [];
  const facilities = facilitiesData?.data ?? [];
  const suitableForOptions = suitableForData?.data ?? [];
  const selectedFacilities = useMemo(
    () => facilities.filter((facility) => values.facility_ids.includes(facility.id)),
    [facilities, values.facility_ids],
  );
  const selectedSuitableForOptions = useMemo(
    () => suitableForOptions.filter((option) => values.suitable_for_option_ids.includes(option.id)),
    [suitableForOptions, values.suitable_for_option_ids],
  );
  const isSaving = isCreating || isUpdating;
  const canSubmit = !isSaving && (!isEdit || (!isVenueLoading && !isVenueError && hydratedVenueId != null));

  useEffect(() => {
    if (!isEdit || !venueDetailsData?.data) return;
    const idKey = String(venueDetailsData.data.id);
    if (hydratedVenueId === idKey) return;
    setValues(mapVenueToFormValues(venueDetailsData.data));
    setHydratedVenueId(idKey);
  }, [hydratedVenueId, isEdit, venueDetailsData?.data]);

  const venueTypeOptions = useMemo(
    () => [
      { value: "", label: "Select venue type" },
      ...venueTypes.map((type) => ({ value: String(type.id), label: type.name })),
    ],
    [venueTypes],
  );

  function patchValues(patch: Partial<VenueFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  async function handleBannerFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const result = await uploadMedia({ file, context: "venue-banner" }).unwrap();
      const mime = result.data.mime ?? file.type ?? null;
      patchValues({
        banner: {
          path: result.data.path,
          url: result.data.url,
          mime,
          media_type: mime?.startsWith("video/") || file.type.startsWith("video/") ? "video" : "image",
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
      const uploaded: VenueFormImage[] = [];
      for (const file of selected) {
        const result = await uploadMedia({ file, context: "venue-gallery" }).unwrap();
        const mime = result.data.mime ?? file.type ?? null;
        uploaded.push({
          path: result.data.path,
          url: result.data.url,
          mime,
          media_type: mime?.startsWith("video/") || file.type.startsWith("video/") ? "video" : "image",
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

  async function submitForm(statusOverride?: "active" | "inactive" | "draft") {
    if (!canSubmit) return;

    const validationError = validateVenueForm(values);
    if (validationError) {
      appToast.error(validationError);
      return;
    }

    const payload = buildVenuePayload(values, statusOverride);

    try {
      if (isEdit) {
        if (venueId == null || venueId === "") {
          appToast.error("Missing venue id.");
          return;
        }
        await updateVenue({ venueId, body: payload }).unwrap();
      } else {
        await createVenue(payload).unwrap();
      }
      router.push("/venues");
    } catch {
      // toast handled by mutation
    }
  }

  if (isEdit && !venueId) {
    return (
      <div className="rounded-[4px] border border-black/20 bg-black/5 px-4 py-6 text-[14px] text-black/70">
        Missing venue id for edit mode.
      </div>
    );
  }

  if (isEdit && isVenueLoading) {
    return (
      <div className="rounded-[4px] border border-black/20 bg-black/5 px-4 py-6 text-[14px] text-black/70">
        Loading venue details...
      </div>
    );
  }

  if (isEdit && isVenueError) {
    return (
      <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-6 text-[14px] text-red-700">
        Could not load this venue.{" "}
        <button type="button" className="underline" onClick={() => router.push("/venues")}>
          Back to venues
        </button>
      </div>
    );
  }

  return (
    <>
      <FormSectionTabs
        barRef={tabsBarRef}
        tabs={sectionTabs}
        activeTabId={activeTab}
        ariaLabel="Venue form sections"
        mode="button"
        onTabSelect={scrollToSection}
      />

      <div className="venue-create-form space-y-8 pb-8 pt-6 sm:pb-12">
        <section id="basic-information" className={SECTION_SCROLL_MT}>
          <SectionHeading>01 / Basic Venue Information</SectionHeading>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[1.55fr_0.9fr_0.9fr] xl:items-stretch xl:gap-9">
            <div className="flex flex-col gap-5 lg:col-span-2 xl:col-span-1">
              <InputField
                label="Venue Name"
                labelClassName="input-heading"
                name="venueName"
                value={values.name}
                onChange={(event) => patchValues({ name: event.target.value })}
                placeholder="e.g. Keys corners"
                className="px-4"
                containerClassName="rounded-[4px] border-black"
              />

              <SelectField
                label="Venue Type"
                labelClassName="input-heading"
                name="venueType"
                value={values.venue_type_id}
                onChange={(event) => patchValues({ venue_type_id: event.target.value })}
                options={venueTypeOptions}
                className="h-[46px] rounded-[4px] border-black px-4 text-[14px]"
              />

              <RichTextEditor
                id="venue-description"
                label="Venue Description"
                labelClassName="input-heading mb-2"
                valueHtml={values.description}
                onChangeHtml={(html) => patchValues({ description: html })}
                placeholder="Enter an optional brief overview description of the venue and its historical significance..."
                minHeightClassName="min-h-[140px]"
              />
            </div>

            <div className="flex min-h-0 flex-col xl:h-full">
              <p className="input-heading mb-2 shrink-0">Venue Banner Image / Videos</p>
              <div className="form-upload-box xl:min-h-0">
                {values.banner?.url ? (
                  <>
                    <VenueMediaPreview
                      media={values.banner}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove banner media"
                      onClick={() => patchValues({ banner: null })}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-[16px] leading-none text-black shadow"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <label
                    htmlFor="venue-banner-upload"
                    className="flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center px-4 text-center sm:min-h-[220px] xl:min-h-0"
                  >
                    <input
                      id="venue-banner-upload"
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
              <p className="input-heading mb-2 shrink-0">Add Gallery Images / Videos</p>
              <div className="flex min-h-[200px] flex-1 flex-col gap-2 sm:min-h-[220px] xl:min-h-0">
                <label
                  htmlFor="venue-gallery-upload"
                  className={[
                    "form-upload-box cursor-pointer px-3",
                    values.gallery.length > 0
                      ? "h-1/2 min-h-[110px] xl:min-h-0"
                      : "min-h-[200px] flex-1 sm:min-h-[220px] xl:min-h-0",
                    values.gallery.length >= MAX_GALLERY_IMAGES ? "pointer-events-none opacity-50" : "",
                  ].join(" ")}
                >
                  <input
                    id="venue-gallery-upload"
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
                          <VenueMediaPreview
                            media={image}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`Remove gallery media ${index + 1}`}
                            onClick={() =>
                              setValues((current) => ({
                                ...current,
                                gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index),
                              }))
                            }
                            className="absolute right-1 top-1 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white text-[12px] leading-none text-black shadow"
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

        <section id="venue-address" className={SECTION_SCROLL_MT}>
          <SectionHeading>02 / Address &amp; Location</SectionHeading>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <InputField
              label="Address Line 1"
              labelClassName="input-heading"
              name="addressLine1"
              value={values.address_line_1}
              onChange={(event) => patchValues({ address_line_1: event.target.value })}
              placeholder="e.g. Keys Park Road"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Address Line 2"
              labelClassName="input-heading"
              name="addressLine2"
              value={values.address_line_2}
              onChange={(event) => patchValues({ address_line_2: event.target.value })}
              placeholder="e.g. Hednesford"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="City / Town"
              labelClassName="input-heading"
              name="cityTown"
              value={values.city}
              onChange={(event) => patchValues({ city: event.target.value })}
              placeholder="e.g. Cannock"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="County / State"
              labelClassName="input-heading"
              name="countyState"
              value={values.state}
              onChange={(event) => patchValues({ state: event.target.value })}
              placeholder="e.g. Staffordshire"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Postcode"
              labelClassName="input-heading"
              name="postcode"
              value={values.postal_code}
              onChange={(event) => patchValues({ postal_code: event.target.value })}
              placeholder="e.g. WS12 2DZ"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Country"
              labelClassName="input-heading"
              name="country"
              value={values.country}
              onChange={(event) => patchValues({ country: event.target.value })}
              placeholder="e.g. United Kingdom"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <div className="sm:col-span-2">
              <InputField
                label="Google Map URL"
                labelClassName="input-heading"
                name="googleMapUrl"
                value={values.google_maps_url}
                onChange={(event) => patchValues({ google_maps_url: event.target.value })}
                placeholder="e.g. https://maps.app.goo.gl/Ah4kdZb3nvaF/TPA"
                className="px-4"
                containerClassName="rounded-[4px] border-black"
              />
            </div>
          </div>
        </section>

        <section id="contact-information" className={SECTION_SCROLL_MT}>
          <SectionHeading>03 / Contact Information</SectionHeading>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <InputField
              label="Contact Name"
              labelClassName="input-heading"
              name="contactName"
              value={values.contact_name}
              onChange={(event) => patchValues({ contact_name: event.target.value })}
              placeholder="e.g. John Smith"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Email Address"
              labelClassName="input-heading"
              name="emailAddress"
              type="email"
              value={values.contact_email}
              onChange={(event) => patchValues({ contact_email: event.target.value })}
              placeholder="e.g. office@hednesfordtownfc.com"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Phone"
              labelClassName="input-heading"
              name="phone"
              value={values.contact_phone}
              onChange={(event) => patchValues({ contact_phone: event.target.value })}
              placeholder="e.g. +44 1543 422870"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Website"
              labelClassName="input-heading"
              name="website"
              value={values.contact_website}
              onChange={(event) => patchValues({ contact_website: event.target.value })}
              placeholder="e.g. www.website.com"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
          </div>
        </section>

        <section id="venue-capacity" className={SECTION_SCROLL_MT}>
          <SectionHeading>04 / Venue Capacity</SectionHeading>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <InputField
              label="Maximum Capacity"
              labelClassName="input-heading"
              name="maximumCapacity"
              value={values.maximum_capacity}
              onChange={(event) => patchValues({ maximum_capacity: event.target.value })}
              placeholder="e.g. 6039"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Standing Capacity"
              labelClassName="input-heading"
              name="standingCapacity"
              value={values.standing_capacity}
              onChange={(event) => patchValues({ standing_capacity: event.target.value })}
              placeholder="e.g. 5000"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Seated Capacity"
              labelClassName="input-heading"
              name="seatedCapacity"
              value={values.seated_capacity}
              onChange={(event) => patchValues({ seated_capacity: event.target.value })}
              placeholder="e.g. 1039"
              className="px-4"
              containerClassName="rounded-[4px] border-black"
            />
          </div>
        </section>

        <section id="facilities-accessibility" className={SECTION_SCROLL_MT}>
          <SectionHeading>05 / Facilities &amp; Accessibility</SectionHeading>

          <div className="space-y-8">
            <div>
              <h3 className="input-heading mb-1">Facilities Available</h3>
              <p className="form-helper-text mt-1 text-[14px] leading-5">
                Add facilities available at your venue that helps customers know more about the space.
              </p>

              <Button
                type="button"
                onClick={() => setIsFacilitiesDrawerOpen(true)}
                className="page-primary-button-action mt-3 h-[34px]"
              >
                <span aria-hidden className="text-[16px] leading-none">
                  +
                </span>
                Select Facilities
              </Button>

              {selectedFacilities.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedFacilities.map((facility) => (
                    <span
                      key={facility.id}
                      className="inline-flex items-center gap-2 rounded-[4px] border border-black/20 bg-black/[0.03] px-3 py-1.5 text-[13px] text-black"
                    >
                      {facility.name}
                      <button
                        type="button"
                        aria-label={`Remove ${facility.name}`}
                        onClick={() =>
                          patchValues({
                            facility_ids: values.facility_ids.filter((id) => id !== facility.id),
                          })
                        }
                        className="cursor-pointer text-[16px] leading-none text-black/60 hover:text-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="input-heading mb-4">Accessibility Audit</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="input-heading mb-3">Accessible Entrance</p>
                  <YesNoRadios
                    name="accessibleEntrance"
                    value={values.accessible_entrance}
                    onChange={(next) => patchValues({ accessible_entrance: next })}
                  />
                </div>
                <div>
                  <p className="input-heading mb-3">Accessible Toilets</p>
                  <YesNoRadios
                    name="accessibleToilets"
                    value={values.accessible_toilet}
                    onChange={(next) => patchValues({ accessible_toilet: next })}
                  />
                </div>
                <div>
                  <p className="input-heading mb-3">Wheelchair Access</p>
                  <YesNoRadios
                    name="wheelchairAccess"
                    value={values.wheelchair_access}
                    onChange={(next) => patchValues({ wheelchair_access: next })}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="detailed-logistics" className={SECTION_SCROLL_MT}>
          <SectionHeading>06 / Detailed Logistics</SectionHeading>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:gap-6">
            <RichTextEditor
              id="venue-parking-information"
              label="Parking Information"
              labelClassName="input-heading mb-2"
              valueHtml={values.parking_information}
              onChangeHtml={(html) => patchValues({ parking_information: html })}
              placeholder="Provide parking guidelines, spaces count, prices..."
              minHeightClassName="min-h-[113px]"
            />
            <RichTextEditor
              id="venue-public-transport-information"
              label="Public Transport Information"
              labelClassName="input-heading mb-2"
              valueHtml={values.public_transport_information}
              onChangeHtml={(html) => patchValues({ public_transport_information: html })}
              placeholder="Bus routes, closest train stations..."
              minHeightClassName="min-h-[113px]"
            />
            <RichTextEditor
              id="venue-travel-information"
              label="Travel Information"
              labelClassName="input-heading mb-2"
              valueHtml={values.travel_information}
              onChangeHtml={(html) => patchValues({ travel_information: html })}
              placeholder="General driving routes, local landmarks..."
              minHeightClassName="min-h-[113px]"
            />
          </div>
        </section>

        <section id="private-hire" className={SECTION_SCROLL_MT}>
          <SectionHeading>07 / Private Hire Options</SectionHeading>

          <div className="space-y-6">
            <div>
              <p className="input-heading mb-3">Private Hire Available</p>
              <YesNoRadios
                name="privateHire"
                value={values.is_private_hire_available}
                onChange={(next) => patchValues({ is_private_hire_available: next })}
              />
            </div>

            <div>
              <p className="input-heading">Suitable For Events Like</p>
              <p className="form-helper-text mt-1 text-[14px] leading-5">
                Choose what this venue is suitable for so customers can find the right space.
              </p>

              <Button
                type="button"
                onClick={() => setIsSuitableForDrawerOpen(true)}
                className="page-primary-button-action mt-3 h-[34px]"
              >
                <span aria-hidden className="text-[16px] leading-none">
                  +
                </span>
                Select Suitable For
              </Button>

              {selectedSuitableForOptions.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSuitableForOptions.map((option) => (
                    <span
                      key={option.id}
                      className="inline-flex items-center gap-2 rounded-[4px] border border-black/20 bg-black/[0.03] px-3 py-1.5 text-[13px] text-black"
                    >
                      {option.name}
                      <button
                        type="button"
                        aria-label={`Remove ${option.name}`}
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            suitable_for_option_ids: current.suitable_for_option_ids.filter(
                              (id) => id !== option.id,
                            ),
                          }))
                        }
                        className="cursor-pointer text-[16px] leading-none text-black/60 hover:text-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <RichTextEditor
              id="venue-private-hire-description"
              label="Private Hire Description"
              labelClassName="input-heading mb-2"
              valueHtml={values.private_hire_description}
              onChangeHtml={(html) => patchValues({ private_hire_description: html })}
              placeholder="Describe fees, hourly rates, catering terms..."
              minHeightClassName="min-h-[95px]"
            />
          </div>
        </section>

        <section id="venue-status" className={SECTION_SCROLL_MT}>
          <SectionHeading>08 / Venue Status</SectionHeading>

          <div>
            <p className="input-heading mb-3">
              Status <span className="text-[11px] font-normal">*</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 sm:gap-x-[60px]">
              <label className="flex items-center gap-2 text-[14px] font-normal text-black">
                <input
                  type="radio"
                  name="venueStatus"
                  checked={values.status === "active"}
                  onChange={() => patchValues({ status: "active" })}
                  className="h-4 w-4 accent-black"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 text-[14px] font-normal text-black">
                <input
                  type="radio"
                  name="venueStatus"
                  checked={values.status === "inactive"}
                  onChange={() => patchValues({ status: "inactive" })}
                  className="h-4 w-4 accent-black"
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      <div className="form-footer-bar -mx-5 sm:-mx-8 sm:px-8">
        <Button
          type="button"
          onClick={() => router.push("/venues")}
          className="form-footer-btn form-footer-btn-secondary"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submitForm("draft")}
          className="form-footer-btn form-footer-btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Draft
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submitForm(values.status === "inactive" ? "inactive" : "active")}
          className="form-footer-btn form-footer-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Publish"}
        </Button>
      </div>

      <SelectFacilitiesDrawer
        isOpen={isFacilitiesDrawerOpen}
        selectedFacilityIds={values.facility_ids}
        onClose={() => setIsFacilitiesDrawerOpen(false)}
        onSave={(facilityIds) => patchValues({ facility_ids: facilityIds })}
        onFacilityDeleted={(facilityId) =>
          setValues((current) => ({
            ...current,
            facility_ids: current.facility_ids.filter((id) => id !== facilityId),
          }))
        }
      />

      <SelectSuitableForDrawer
        isOpen={isSuitableForDrawerOpen}
        selectedOptionIds={values.suitable_for_option_ids}
        onClose={() => setIsSuitableForDrawerOpen(false)}
        onSave={(optionIds) => patchValues({ suitable_for_option_ids: optionIds })}
        onOptionDeleted={(optionId) =>
          setValues((current) => ({
            ...current,
            suitable_for_option_ids: current.suitable_for_option_ids.filter((id) => id !== optionId),
          }))
        }
      />
    </>
  );
}
