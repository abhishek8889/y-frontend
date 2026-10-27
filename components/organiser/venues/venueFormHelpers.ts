import type { Venue, VenuePayload } from "@/apis/organisation/venuesApi";
import { isVideoMedia, type MediaLike } from "@/lib/media/isVideoMedia";

export type VenueFormImage = {
  id?: number;
  path: string;
  url: string;
  alt_text?: string | null;
  /** Present after upload / API; used to choose image vs video preview. */
  mime?: string | null;
  media_type?: "image" | "video" | string | null;
};

/** True when media_type/mime/URL indicates video. */
export function isVenueVideoMedia(media: MediaLike | null | undefined) {
  return isVideoMedia(media);
}

export type VenueFormValues = {
  name: string;
  venue_type_id: string;
  description: string;
  maximum_capacity: string;
  standing_capacity: string;
  seated_capacity: string;
  status: "active" | "inactive" | "draft";
  is_private_hire_available: boolean;
  private_hire_description: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  google_maps_url: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_website: string;
  accessible_entrance: boolean;
  accessible_toilet: boolean;
  wheelchair_access: boolean;
  parking_information: string;
  public_transport_information: string;
  travel_information: string;
  facility_ids: number[];
  suitable_for_option_ids: number[];
  banner: VenueFormImage | null;
  gallery: VenueFormImage[];
};

export function createEmptyVenueFormValues(): VenueFormValues {
  return {
    name: "",
    venue_type_id: "",
    description: "",
    maximum_capacity: "",
    standing_capacity: "",
    seated_capacity: "",
    status: "active",
    is_private_hire_available: true,
    private_hire_description: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    google_maps_url: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_website: "",
    accessible_entrance: true,
    accessible_toilet: true,
    wheelchair_access: true,
    parking_information: "",
    public_transport_information: "",
    travel_information: "",
    facility_ids: [],
    suitable_for_option_ids: [],
    banner: null,
    gallery: [],
  };
}

function toInputString(value: string | number | null | undefined) {
  if (value == null) return "";
  return String(value);
}

export function mapVenueToFormValues(venue: Venue): VenueFormValues {
  const bannerImage = venue.images?.find((image) => image.type === "banner") ?? null;
  const galleryImages = (venue.images ?? []).filter((image) => image.type === "gallery");

  return {
    name: venue.name ?? "",
    venue_type_id: venue.venue_type_id != null ? String(venue.venue_type_id) : "",
    description: venue.description ?? "",
    maximum_capacity: toInputString(venue.maximum_capacity),
    standing_capacity: toInputString(venue.standing_capacity),
    seated_capacity: toInputString(venue.seated_capacity),
    status: venue.status === "inactive" || venue.status === "draft" ? venue.status : "active",
    is_private_hire_available: Boolean(venue.is_private_hire_available),
    private_hire_description: venue.private_hire_description ?? "",
    address_line_1: venue.address?.address_line_1 ?? "",
    address_line_2: venue.address?.address_line_2 ?? "",
    city: venue.address?.city ?? "",
    state: venue.address?.state ?? "",
    postal_code: venue.address?.postal_code ?? "",
    country: venue.address?.country ?? "",
    google_maps_url: venue.address?.google_maps_url ?? "",
    contact_name: venue.contact?.name ?? "",
    contact_email: venue.contact?.email ?? "",
    contact_phone: venue.contact?.phone ?? "",
    contact_website: venue.contact?.website ?? "",
    accessible_entrance: venue.accessibility?.accessible_entrance ?? true,
    accessible_toilet: venue.accessibility?.accessible_toilet ?? true,
    wheelchair_access: venue.accessibility?.wheelchair_access ?? true,
    parking_information: venue.logistics?.parking_information ?? "",
    public_transport_information: venue.logistics?.public_transport_information ?? "",
    travel_information: venue.logistics?.travel_information ?? "",
    facility_ids: (venue.facilities ?? []).map((facility) => facility.id),
    suitable_for_option_ids: (venue.suitable_for_options ?? []).map((option) => option.id),
    banner: bannerImage
      ? {
          id: bannerImage.id,
          path: bannerImage.path,
          url: bannerImage.url,
          alt_text: bannerImage.alt_text,
          mime: bannerImage.mime ?? null,
          media_type: bannerImage.media_type ?? null,
        }
      : null,
    gallery: galleryImages.slice(0, 4).map((image) => ({
      id: image.id,
      path: image.path,
      url: image.url,
      alt_text: image.alt_text,
      mime: image.mime ?? null,
      media_type: image.media_type ?? null,
    })),
  };
}

function parseOptionalInt(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasAnyAddress(values: VenueFormValues) {
  return Boolean(
    values.address_line_1.trim() ||
      values.address_line_2.trim() ||
      values.city.trim() ||
      values.state.trim() ||
      values.postal_code.trim() ||
      values.country.trim() ||
      values.google_maps_url.trim(),
  );
}

function hasAnyContact(values: VenueFormValues) {
  return Boolean(
    values.contact_name.trim() ||
      values.contact_email.trim() ||
      values.contact_phone.trim() ||
      values.contact_website.trim(),
  );
}

/** Treat empty / placeholder-only rich text as blank. */
export function normalizeRichTextHtml(html: string | null | undefined) {
  const trimmed = String(html ?? "").trim();
  if (!trimmed) return null;
  const textOnly = trimmed
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return textOnly ? trimmed : null;
}

function hasAnyLogistics(values: VenueFormValues) {
  return Boolean(
    normalizeRichTextHtml(values.parking_information) ||
      normalizeRichTextHtml(values.public_transport_information) ||
      normalizeRichTextHtml(values.travel_information),
  );
}

export function validateVenueForm(values: VenueFormValues): string | null {
  if (!values.name.trim()) return "Venue name is required.";

  if (hasAnyAddress(values)) {
    if (!values.address_line_1.trim()) return "Address line 1 is required.";
    if (!values.city.trim()) return "City / town is required.";
    if (!values.postal_code.trim()) return "Postcode is required.";
    if (!values.country.trim()) return "Country is required.";
  }

  if (hasAnyContact(values) && !values.contact_name.trim()) {
    return "Contact name is required when contact details are provided.";
  }

  return null;
}

export function buildVenuePayload(
  values: VenueFormValues,
  statusOverride?: "active" | "inactive" | "draft",
): VenuePayload {
  const images = [
    ...(values.banner
      ? [
          {
            ...(values.banner.id ? { id: values.banner.id } : {}),
            type: "banner" as const,
            path: values.banner.path,
            alt_text: values.banner.alt_text ?? null,
            sort_order: 0,
          },
        ]
      : []),
    ...values.gallery.map((image, index) => ({
      ...(image.id ? { id: image.id } : {}),
      type: "gallery" as const,
      path: image.path,
      alt_text: image.alt_text ?? null,
      sort_order: index + 1,
    })),
  ];

  const payload: VenuePayload = {
    name: values.name.trim(),
    venue_type_id: values.venue_type_id ? Number(values.venue_type_id) : null,
    description: normalizeRichTextHtml(values.description),
    maximum_capacity: parseOptionalInt(values.maximum_capacity),
    standing_capacity: parseOptionalInt(values.standing_capacity),
    seated_capacity: parseOptionalInt(values.seated_capacity),
    status: statusOverride ?? values.status,
    is_private_hire_available: values.is_private_hire_available,
    private_hire_description: normalizeRichTextHtml(values.private_hire_description),
    facility_ids: values.facility_ids,
    suitable_for_option_ids: values.suitable_for_option_ids,
    accessibility: {
      accessible_entrance: values.accessible_entrance,
      accessible_toilet: values.accessible_toilet,
      wheelchair_access: values.wheelchair_access,
    },
    images,
  };

  if (hasAnyAddress(values)) {
    payload.address = {
      address_line_1: values.address_line_1.trim(),
      address_line_2: values.address_line_2.trim() || null,
      city: values.city.trim(),
      state: values.state.trim() || null,
      postal_code: values.postal_code.trim(),
      country: values.country.trim(),
      google_maps_url: values.google_maps_url.trim() || null,
    };
  }

  if (hasAnyContact(values)) {
    payload.contact = {
      name: values.contact_name.trim(),
      email: values.contact_email.trim() || null,
      phone: values.contact_phone.trim() || null,
      website: values.contact_website.trim() || null,
    };
  }

  if (hasAnyLogistics(values)) {
    payload.logistics = {
      parking_information: normalizeRichTextHtml(values.parking_information),
      public_transport_information: normalizeRichTextHtml(
        values.public_transport_information,
      ),
      travel_information: normalizeRichTextHtml(values.travel_information),
    };
  }

  return payload;
}

export function toggleNumberInList(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}
