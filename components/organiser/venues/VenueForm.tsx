"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { appToast } from "@/lib/ui/toast";
import { SelectFacilitiesDrawer } from "@/components/organiser/venues/SelectFacilitiesDrawer";
import { SelectSuitableForDrawer } from "@/components/organiser/venues/SelectSuitableForDrawer";
import {
  buildVenuePayload,
  createEmptyVenueFormValues,
  mapVenueToFormValues,
  validateVenueForm,
  type VenueFormValues,
} from "@/components/organiser/venues/venueFormHelpers";

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
    <div className="flex items-center gap-5">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name={name}
          checked={value}
          onChange={() => onChange(true)}
          className="h-4 w-4 accent-black"
        />
        <span>Yes</span>
      </label>
      <label className="flex items-center gap-2">
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
      <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-[4px] bg-black/5 text-black/60">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 16.5L14 11.5L18 15.5V18.5H6V14.5L9 16.5ZM8.5 7.5C8.5 8.33 7.83 9 7 9C6.17 9 5.5 8.33 5.5 7.5C5.5 6.67 6.17 6 7 6C7.83 6 8.5 6.67 8.5 7.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-black/60">
        {uploading ? "Uploading..." : "Drag and drop image file here"}
      </p>
      <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.1em] text-black/45">
        PNG, JPG, up to 10MB
      </p>
    </>
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
      patchValues({
        banner: {
          path: result.data.path,
          url: result.data.url,
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
      const uploaded = [];
      for (const file of selected) {
        const result = await uploadMedia({ file, context: "venue-gallery" }).unwrap();
        uploaded.push({
          path: result.data.path,
          url: result.data.url,
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

          <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr_0.9fr] xl:items-stretch">
            <div className="flex flex-col gap-4">
              <InputField
                label="Venue Name"
                name="venueName"
                value={values.name}
                onChange={(event) => patchValues({ name: event.target.value })}
                placeholder="e.g. Keys corners"
                className="text-[16px] placeholder:text-black/45"
                containerClassName="rounded-[4px] border-black"
              />

              <SelectField
                label="Venue Type"
                name="venueType"
                value={values.venue_type_id}
                onChange={(event) => patchValues({ venue_type_id: event.target.value })}
                options={venueTypeOptions}
                className="h-[46px] rounded-[4px] border-black text-[14px] uppercase tracking-[0.12em]"
              />

              <InputField
                as="textarea"
                label="Venue Description"
                name="venueDescription"
                rows={4}
                value={values.description}
                onChange={(event) => patchValues({ description: event.target.value })}
                placeholder="Enter an optional brief overview description of the venue and its historical significance..."
                className="text-[16px] placeholder:text-black/45"
                containerClassName="min-h-[140px] rounded-[4px] border-black"
              />
            </div>

            <div className="flex min-h-0 flex-col xl:h-full">
              <p className="mb-2 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                Venue Banner / Videos
              </p>
              <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white xl:min-h-0">
                {values.banner?.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={values.banner.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove banner image"
                      onClick={() => patchValues({ banner: null })}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black shadow"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <label
                    htmlFor="venue-banner-upload"
                    className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center px-4 text-center xl:min-h-0"
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
              <p className="mb-2 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                Add Gallery Images / Videos
              </p>
              <div className="flex min-h-[220px] flex-1 flex-col gap-2 xl:min-h-0">
                <label
                  htmlFor="venue-gallery-upload"
                  className={[
                    "flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[4px] border-[1.5px] border-dashed border-black/60 bg-white px-3 text-center",
                    values.gallery.length > 0 ? "h-1/2 min-h-[110px] xl:min-h-0" : "min-h-[220px] flex-1 xl:min-h-0",
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

        <section id="venue-address" className="scroll-mt-24">
          <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
            <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
              02 / Address &amp; Location
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Address Line 1"
              name="addressLine1"
              value={values.address_line_1}
              onChange={(event) => patchValues({ address_line_1: event.target.value })}
              placeholder="e.g. Keys Park Road"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Address Line 2"
              name="addressLine2"
              value={values.address_line_2}
              onChange={(event) => patchValues({ address_line_2: event.target.value })}
              placeholder="e.g. Hednesford"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="City / Town"
              name="cityTown"
              value={values.city}
              onChange={(event) => patchValues({ city: event.target.value })}
              placeholder="e.g. Cannock"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="County / State"
              name="countyState"
              value={values.state}
              onChange={(event) => patchValues({ state: event.target.value })}
              placeholder="e.g. Staffordshire"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Postcode"
              name="postcode"
              value={values.postal_code}
              onChange={(event) => patchValues({ postal_code: event.target.value })}
              placeholder="e.g. WS12 2DZ"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Country"
              name="country"
              value={values.country}
              onChange={(event) => patchValues({ country: event.target.value })}
              placeholder="e.g. United Kingdom"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <div className="md:col-span-2">
              <InputField
                label="Google Map URL"
                name="googleMapUrl"
                value={values.google_maps_url}
                onChange={(event) => patchValues({ google_maps_url: event.target.value })}
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
            <InputField
              label="Contact Name"
              name="contactName"
              value={values.contact_name}
              onChange={(event) => patchValues({ contact_name: event.target.value })}
              placeholder="e.g. John Smith"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Email Address"
              name="emailAddress"
              type="email"
              value={values.contact_email}
              onChange={(event) => patchValues({ contact_email: event.target.value })}
              placeholder="e.g. office@hednesfordtownfc.com"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Phone"
              name="phone"
              value={values.contact_phone}
              onChange={(event) => patchValues({ contact_phone: event.target.value })}
              placeholder="e.g. +44 1543 422870"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Website"
              name="website"
              value={values.contact_website}
              onChange={(event) => patchValues({ contact_website: event.target.value })}
              placeholder="e.g. www.website.com"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
          </div>
        </section>

        <section id="venue-capacity" className="scroll-mt-24">
          <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
            <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
              04 / Venue Capacity
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <InputField
              label="Maximum Capacity"
              name="maximumCapacity"
              value={values.maximum_capacity}
              onChange={(event) => patchValues({ maximum_capacity: event.target.value })}
              placeholder="e.g. 6039"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Standing Capacity"
              name="standingCapacity"
              value={values.standing_capacity}
              onChange={(event) => patchValues({ standing_capacity: event.target.value })}
              placeholder="e.g. 5000"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              label="Seated Capacity"
              name="seatedCapacity"
              value={values.seated_capacity}
              onChange={(event) => patchValues({ seated_capacity: event.target.value })}
              placeholder="e.g. 1039"
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
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
              <h3 className="text-[16px] font-bold uppercase tracking-[0.12em] text-black">
                Facilities Available
              </h3>
              <p className="mt-1 text-[14px] leading-[20px] text-[#6E6B69]">
                Add facilities available at your venue that helps customers know more about the space.
              </p>

              <Button
                type="button"
                onClick={() => setIsFacilitiesDrawerOpen(true)}
                className="mt-4 h-[42px] rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.12em] text-white"
              >
                + Select Facilities
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
                        className="text-[16px] leading-none text-black/60 hover:text-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="mb-4 text-[16px] font-bold uppercase tracking-[0.12em] text-black">
                Accessibility Audit
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.12em] text-black">
                    Accessible Entrance
                  </p>
                  <YesNoRadios
                    name="accessibleEntrance"
                    value={values.accessible_entrance}
                    onChange={(next) => patchValues({ accessible_entrance: next })}
                  />
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.12em] text-black">
                    Accessible Toilets
                  </p>
                  <YesNoRadios
                    name="accessibleToilets"
                    value={values.accessible_toilet}
                    onChange={(next) => patchValues({ accessible_toilet: next })}
                  />
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.12em] text-black">
                    Wheelchair Access
                  </p>
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

        <section id="detailed-logistics" className="scroll-mt-24">
          <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
            <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
              06 / Detailed Logistics
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <InputField
              as="textarea"
              label="Parking Information"
              name="parkingInformation"
              rows={4}
              value={values.parking_information}
              onChange={(event) => patchValues({ parking_information: event.target.value })}
              placeholder="Provide parking guidelines, spaces count, prices..."
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              as="textarea"
              label="Public Transport Information"
              name="publicTransportInformation"
              rows={4}
              value={values.public_transport_information}
              onChange={(event) => patchValues({ public_transport_information: event.target.value })}
              placeholder="Bus routes, closest train stations..."
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
            <InputField
              as="textarea"
              label="Travel Information"
              name="travelInformation"
              rows={4}
              value={values.travel_information}
              onChange={(event) => patchValues({ travel_information: event.target.value })}
              placeholder="General driving routes, local landmarks..."
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
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
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
                Private Hire Available
              </p>
              <YesNoRadios
                name="privateHire"
                value={values.is_private_hire_available}
                onChange={(next) => patchValues({ is_private_hire_available: next })}
              />
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-black">Suitable For</p>
              <p className="mt-1 text-[14px] leading-[20px] text-[#6E6B69]">
                Choose what this venue is suitable for so customers can find the right space.
              </p>

              <Button
                type="button"
                onClick={() => setIsSuitableForDrawerOpen(true)}
                className="mt-4 h-[42px] rounded-[4px] border border-black bg-black px-4 text-[12px] font-bold uppercase tracking-[0.12em] text-white"
              >
                + Select Suitable For
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
                        className="text-[16px] leading-none text-black/60 hover:text-black"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <InputField
              as="textarea"
              label="Private Hire Description"
              name="privateHireDescription"
              rows={4}
              value={values.private_hire_description}
              onChange={(event) => patchValues({ private_hire_description: event.target.value })}
              placeholder="Describe fees, hourly rates, catering terms..."
              className="text-[16px] placeholder:text-black/45"
              containerClassName="rounded-[4px] border-black"
            />
          </div>
        </section>

        <section id="venue-status" className="scroll-mt-24">
          <div className="mb-5 flex items-center justify-between border-b border-black/30 pb-3">
            <h2 className="text-[24px] font-black uppercase tracking-[-0.05em] text-black">
              08 / Venue Status
            </h2>
          </div>

          <div>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black">
              Status <span className="text-black">*</span>
            </p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="venueStatus"
                  checked={values.status === "active"}
                  onChange={() => patchValues({ status: "active" })}
                  className="h-4 w-4 accent-black"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2">
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
          disabled={!canSubmit}
          onClick={() => void submitForm("draft")}
          className="h-[42px] min-w-[120px] rounded-[4px] border border-black bg-[#f2f2f2] px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-black disabled:opacity-50"
        >
          Draft
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submitForm(values.status === "inactive" ? "inactive" : "active")}
          className="h-[42px] min-w-[120px] rounded-[4px] border border-black bg-black px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEdit ? "Save changes" : "Publish"}
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
