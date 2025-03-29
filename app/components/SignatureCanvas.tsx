"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export default function SignatureCanvasComponent({
  onSave,
  onClose,
}: SignatureCanvasProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState("");

  // Clear Signature
  const handleClear = () => {
    sigCanvas.current?.clear();
    setError("");
  };

  // Save Signature
  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      setError("Please draw your signature before saving.");
      return;
    }

    try {
      // Get trimmed canvas data
      const dataUrl = sigCanvas.current
        ? sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
        : "";
      onSave(dataUrl);
      onClose();
    } catch (err) {
      setError("Failed to save signature. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold mb-2">Draw Your Signature</h2>

        {/* Signature Canvas */}
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "border border-gray-300 w-full h-64 rounded-lg",
          }}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleClear}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
