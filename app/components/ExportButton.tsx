"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ExportButtonProps {
  pdfContainerRef: React.RefObject<HTMLDivElement | null>;
  annotations: {
    type: "highlight" | "comment" | "signature";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    signatureDataUrl?: string;
    text?: string;
  }[];
}

export default function ExportButton({
  pdfContainerRef,
  annotations,
}: ExportButtonProps) {
  
  const handleExport = async () => {
    if (!pdfContainerRef.current) {
      alert("No PDF container found!");
      return;
    }

    try {
      // 🎯 Capture the current PDF container as canvas
      const canvas = await html2canvas(pdfContainerRef.current);
      const imgData = canvas.toDataURL("image/png");

      // 🎯 Initialize jsPDF
      const pdf = new jsPDF("p", "mm", "a4");

      // 🎯 Add the captured image to the PDF
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight =
        (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // 🎯 Loop through annotations to add comments or signature
      annotations.forEach((ann) => {
        if (ann.type === "signature" && ann.signatureDataUrl) {
          pdf.addImage(
            ann.signatureDataUrl,
            "PNG",
            ann.x || 50,
            ann.y || 100,
            ann.width || 40,
            ann.height || 30
          );
        }

        if (ann.type === "comment" && ann.text) {
          pdf.setFont("Helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(ann.text, ann.x || 10, ann.y || 10);
        }
      });

      // 🎯 Save the exported file
      pdf.save("annotated-document.pdf");
      alert("✅ PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("❌ Failed to export PDF.");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-500 text-white rounded-md mt-4 hover:bg-green-600"
    >
      Export PDF
    </button>
  );
}
