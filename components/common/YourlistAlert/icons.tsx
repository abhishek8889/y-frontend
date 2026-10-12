import type { SVGProps } from "react";

/** Solid black circle with white check — matches the success alert reference. */
export function SuccessCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="36" cy="36" r="36" fill="black" />
      <path
        d="M22 36.5 31.5 46 50 27.5"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Warning triangle for confirmation / destructive alerts. */
export function WarningAlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M31.2 14.4 8.4 54.2A5.4 5.4 0 0 0 13.1 62.4h45.8a5.4 5.4 0 0 0 4.7-8.2L40.8 14.4a5.4 5.4 0 0 0-9.6 0Z"
        stroke="black"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M36 28v16" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="36" cy="51" r="2.5" fill="black" />
    </svg>
  );
}
