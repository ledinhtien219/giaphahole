"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ExportOpts = {
  format?: "a4" | "a3";
  orientation?: "portrait" | "landscape";
  marginMm?: number;
  overlapMm?: number;
  zoom?: number;
  filename?: string;
};

async function exportTreePdfTiled(opts: ExportOpts = {}) {
  const {
    format = "a4",
    orientation = "landscape",
    marginMm = 8,
    overlapMm = 6,
    zoom = 1.8,
    filename = "gia-pha-tiled.pdf",
  } = opts;

  const el = document.getElementById("tree-container");
  if (!el) {
    alert("Không tìm thấy vùng sơ đồ (tree-container).");
    return;
  }

  const canvas = await html2canvas(el, {
  backgroundColor: "#ffffff",
  scale: 2,
  useCORS: true,
  logging: false,

  onclone: (clonedDoc) => {
    const all = clonedDoc.querySelectorAll("*");

    all.forEach((node) => {
      const style = window.getComputedStyle(node as Element);

      // Nếu có màu dạng lab / oklch thì ép về màu thường
      if (style.color?.includes("lab") || style.color?.includes("oklch")) {
        (node as HTMLElement).style.color = "#000000";
      }

      if (style.backgroundColor?.includes("lab") || style.backgroundColor?.includes("oklch")) {
        (node as HTMLElement).style.backgroundColor = "#ffffff";
      }
    });
  },
});

  const pdf = new jsPDF({ orientation, unit: "mm", format });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const printableW = pageW - marginMm * 2;
  const printableH = pageH - marginMm * 2;

  const mmPerPxFitWidth = printableW / canvas.width;
  const mmPerPx = mmPerPxFitWidth * zoom;

  const tileWpx = Math.max(200, Math.floor(printableW / mmPerPx));
  const tileHpx = Math.max(200, Math.floor(printableH / mmPerPx));

  const overlapPx = Math.max(0, Math.floor(overlapMm / mmPerPx));
  const stepX = Math.max(50, tileWpx - overlapPx);
  const stepY = Math.max(50, tileHpx - overlapPx);

  const tileCanvas = document.createElement("canvas");
  const tctx = tileCanvas.getContext("2d");

  let pageIndex = 0;

  for (let y = 0; y < canvas.height; y += stepY) {
    for (let x = 0; x < canvas.width; x += stepX) {
      const sw = Math.min(tileWpx, canvas.width - x);
      const sh = Math.min(tileHpx, canvas.height - y);

      tileCanvas.width = sw;
      tileCanvas.height = sh;

      if (!tctx) continue;

      tctx.clearRect(0, 0, sw, sh);
      tctx.fillStyle = "#ffffff";
      tctx.fillRect(0, 0, sw, sh);
      tctx.drawImage(canvas, x, y, sw, sh, 0, 0, sw, sh);

      const imgData = tileCanvas.toDataURL("image/png");

      if (pageIndex > 0) pdf.addPage();

      let drawW = printableW;
      let drawH = (sh * drawW) / sw;

      if (drawH > printableH) {
        drawH = printableH;
        drawW = (sw * drawH) / sh;
      }

      const dx = marginMm + (printableW - drawW) / 2;
      const dy = marginMm + (printableH - drawH) / 2;

      pdf.addImage(imgData, "PNG", dx, dy, drawW, drawH, undefined, "FAST");
      pageIndex++;
    }
  }

  pdf.save(filename);
}

export default function ExportPdfButton() {
  return (
    <button
      onClick={() =>
        exportTreePdfTiled({
          format: "a4",
          orientation: "landscape",
          zoom: 1.8, // muốn chữ to hơn: 2.2
          overlapMm: 6,
        })
      }
      className="px-3 py-2 rounded bg-black text-white"
      title="Xuất PDF dạng lưới"
    >
      Xuất PDF
    </button>
  );
}