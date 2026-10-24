import QRCode from "qrcode";
import { jsPDF } from "jspdf";

const universRegular = "/fonts/ticket/UniversRegular.ttf";
const universBold = "/fonts/ticket/UniversBold.ttf";
const universCondensedBold = "/fonts/ticket/UniversCnBold.ttf";

export type OrderTicketPdfTicket = {
  eventName: string;
  startsLabel: string | null;
  endsLabel: string | null;
  venueName: string | null;
  address: string | null;
  ticketName: string | null;
  offerName: string | null;
  ticketId: string | null;
  code: string | null;
  organisationName: string | null;
  bannerUrl: string | null;
};

export type OrderTicketsPdfInput = {
  orderId: string;
  customerName: string | null;
  customerEmail: string | null;
  tickets: OrderTicketPdfTicket[];
};

type RasterImage = {
  dataUrl: string;
  width: number;
  height: number;
};

const fontBase64Cache = new Map<string, Promise<string>>();

function fontFileUrl(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return new URL(src, window.location.origin).toString();
}

function fontBase64(src: string) {
  const url = fontFileUrl(src);
  const cached = fontBase64Cache.get(url);
  if (cached) return cached;

  const pending = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load the ticket font.");
      return response.arrayBuffer();
    })
    .then((buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      return btoa(binary);
    });

  fontBase64Cache.set(url, pending);
  return pending;
}

function loadBanner(url: string): Promise<RasterImage | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const targetRatio = 5.2;
        const sourceRatio = image.naturalWidth / image.naturalHeight;
        let cropX = 0;
        let cropY = 0;
        let cropWidth = image.naturalWidth;
        let cropHeight = image.naturalHeight;

        if (sourceRatio > targetRatio) {
          cropWidth = image.naturalHeight * targetRatio;
          cropX = (image.naturalWidth - cropWidth) / 2;
        } else {
          cropHeight = image.naturalWidth / targetRatio;
          cropY = (image.naturalHeight - cropHeight) / 2;
        }

        const width = 1200;
        const height = Math.round(width / targetRatio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.86),
          width,
          height,
        });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function customerLine(input: OrderTicketsPdfInput) {
  const name = input.customerName?.trim();
  const email = input.customerEmail?.trim();
  if (name && email) return `${name} (${email})`;
  return name || email || "";
}

async function registerFonts(doc: jsPDF) {
  const [regular, bold, condensedBold] = await Promise.all([
    fontBase64(universRegular),
    fontBase64(universBold),
    fontBase64(universCondensedBold),
  ]);

  doc.addFileToVFS("Univers-Regular.ttf", regular);
  doc.addFont("Univers-Regular.ttf", "Univers", "normal");
  doc.addFileToVFS("Univers-Bold.ttf", bold);
  doc.addFont("Univers-Bold.ttf", "Univers", "bold");
  doc.addFileToVFS("UniversCn-Bold.ttf", condensedBold);
  doc.addFont("UniversCn-Bold.ttf", "UniversCondensed", "bold");
}

function wrappedLines(doc: jsPDF, text: string, width: number, font: string, style: "normal" | "bold", size: number) {
  doc.setFont(font, style);
  doc.setFontSize(size);
  return doc.splitTextToSize(text, width) as string[];
}

export async function createOrderTicketsPdf(input: OrderTicketsPdfInput) {
  const tickets = input.tickets.filter((ticket) => ticket.eventName.trim() || ticket.code || ticket.ticketId);
  if (tickets.length === 0) {
    throw new Error("This order has no tickets to download.");
  }

  const codes = [...new Set(tickets.map((ticket) => ticket.code?.trim()).filter((code): code is string => Boolean(code)))];
  const bannerUrls = [...new Set(tickets.map((ticket) => ticket.bannerUrl?.trim()).filter((url): url is string => Boolean(url)))];

  const [qrEntries, bannerEntries] = await Promise.all([
    Promise.all(
      codes.map(async (code) => {
        const dataUrl = await QRCode.toDataURL(code, {
          margin: 0,
          width: 280,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#ffffff" },
        });
        return [code, dataUrl] as const;
      }),
    ),
    Promise.all(
      bannerUrls.map(async (url) => {
        const image = await loadBanner(url);
        return [url, image] as const;
      }),
    ),
  ]);

  const qrByCode = new Map(qrEntries);
  const bannerByUrl = new Map(bannerEntries);

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  await registerFonts(doc);
  doc.setProperties({
    title: `Yourlist tickets ${input.orderId}`,
    creator: "Yourlist",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const cardPad = 5;
  const qrSize = 32;
  const textWidth = contentWidth - cardPad * 2 - qrSize - 6;
  let cursorY = margin;

  const drawHeader = () => {
    doc.setFont("UniversCondensed", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("YOURSLIST", margin, cursorY + 5);
    cursorY += 10;

    doc.setFont("Univers", "normal");
    doc.setFontSize(11);
    doc.text(`Order: ${input.orderId}`, margin, cursorY + 4);
    cursorY += 6;

    const customer = customerLine(input);
    if (customer) {
      const lines = wrappedLines(doc, `Customer: ${customer}`, contentWidth, "Univers", "normal", 11);
      doc.text(lines, margin, cursorY + 4);
      cursorY += lines.length * 5.2;
    }

    cursorY += 4;
  };

  drawHeader();

  for (const ticket of tickets) {
    const banner = ticket.bannerUrl ? bannerByUrl.get(ticket.bannerUrl.trim()) : null;
    const bannerHeight = banner ? 32 : 0;
    const details: { text: string; font: string; style: "normal" | "bold"; size: number; gap: number; color: [number, number, number] }[] = [
      { text: ticket.eventName || "Event", font: "Univers", style: "bold", size: 13, gap: 6.2, color: [0, 0, 0] },
    ];

    if (ticket.startsLabel) details.push({ text: `Starts: ${ticket.startsLabel}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.endsLabel) details.push({ text: `Ends: ${ticket.endsLabel}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.venueName) details.push({ text: `Venue: ${ticket.venueName}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.address) details.push({ text: ticket.address, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.ticketName) details.push({ text: `Ticket: ${ticket.ticketName}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.offerName) details.push({ text: `Offer: ${ticket.offerName}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.ticketId) details.push({ text: `Ticket ID: ${ticket.ticketId}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    if (ticket.organisationName) details.push({ text: `Organisation: ${ticket.organisationName}`, font: "Univers", style: "normal", size: 10.5, gap: 5, color: [0, 0, 0] });
    details.push({
      text: "Present this QR code at the gate. Each code admits one person.",
      font: "Univers",
      style: "normal",
      size: 9,
      gap: 4.6,
      color: [90, 90, 90],
    });

    const measured = details.map((detail) => ({
      ...detail,
      lines: wrappedLines(doc, detail.text, textWidth, detail.font, detail.style, detail.size),
    }));
    const textHeight = measured.reduce((sum, detail) => sum + detail.lines.length * detail.gap, 0);
    const code = ticket.code?.trim() || "";
    const codeLines = code ? [code.slice(0, Math.ceil(code.length / 2)), code.slice(Math.ceil(code.length / 2))].filter(Boolean) : [];
    const qrBlockHeight = (qrByCode.has(code) ? qrSize : 0) + (codeLines.length ? 3.5 + codeLines.length * 3.1 : 0);
    const bodyHeight = Math.max(textHeight, qrBlockHeight);
    const cardHeight = cardPad + bannerHeight + (bannerHeight ? 4 : 0) + bodyHeight + cardPad;

    if (cursorY + cardHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setDrawColor(196, 196, 196);
    doc.setLineWidth(0.3);
    doc.rect(margin, cursorY, contentWidth, cardHeight);

    let innerY = cursorY + cardPad;
    if (banner) {
      doc.addImage(banner.dataUrl, "JPEG", margin + cardPad, innerY, contentWidth - cardPad * 2, bannerHeight);
      innerY += bannerHeight + 4;
    }

    const textTop = innerY;
    for (const detail of measured) {
      doc.setFont(detail.font, detail.style);
      doc.setFontSize(detail.size);
      doc.setTextColor(...detail.color);
      doc.text(detail.lines, margin + cardPad, innerY + detail.size * 0.35);
      innerY += detail.lines.length * detail.gap;
    }

    if (code && qrByCode.has(code)) {
      const qrX = margin + contentWidth - cardPad - qrSize;
      doc.addImage(qrByCode.get(code) as string, "PNG", qrX, textTop, qrSize, qrSize);
      if (codeLines.length) {
        doc.setFont("Univers", "normal");
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(codeLines, qrX + qrSize / 2, textTop + qrSize + 4, { align: "center", lineHeightFactor: 1.15 });
      }
    }

    cursorY += cardHeight + 5;
  }

  return doc.output("blob");
}

export function savePdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
