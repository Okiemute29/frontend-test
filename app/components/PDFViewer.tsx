import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import AnnotationToolbar from "./AnnotationToolbar";
import ExportButton from "./ExportButton";
import SignatureCanvas from "./SignatureCanvas";
import { PDFDocument, rgb } from "pdf-lib";
import Draggable from "react-draggable";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Use .mjs extension for ES modules
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

interface Annotation {
  id: string;
  type: "highlight" | "underline" | "comment" | "signature";
  text?: string;
  color?: string;
  commentText?: string;
  signatureDataUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber?: number; // Track which page the signature belongs to
}

interface PDFViewerProps {
  file: File | null;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentDimensions, setDocumentDimensions] = useState({ width: 0, height: 0 });
  
  // Create a ref for the PDF container
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
;
  
  // Create a ref map to store refs for each signature annotation
  const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLElement | null> }>({});



  
  // Generate a unique ID for annotations
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Update document dimensions when PDF is rendered
  const onPageRenderSuccess = (page: any) => {
    const { width, height } = page;
    setDocumentDimensions({ width, height });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      console.log("Selected Text:", text);
      setSelectedText(text);
    } else {
      console.log("No text selected");
    }
  };

  const addAnnotation = (type: "highlight" | "underline" | "comment") => {
    if (!selectedText) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    if (type === "highlight") {
      console.log(selectedText);
      span.style.backgroundColor = "yellow";
      span.style.color = "white";
    } else if (type === "underline") {
      span.style.textDecoration = "underline";
      span.style.textDecorationColor = "blue";
    } else if (type === "comment") {
      const comment = prompt("Enter your comment:");
      if (comment) {
        span.title = comment;
        span.style.backgroundColor = "lightgreen";
        span.style.color = "white";
      } else {
        return;
      }
    }

    const text = range.extractContents();
    span.appendChild(text);
    range.insertNode(span);

    setAnnotations((prev) => [
      ...prev, 
      { 
        id: generateId(),
        type, 
        text: selectedText,
        x: 0,
        y: 0,
        width: 150,
        height: 100,
        pageNumber: currentPage
      }
    ]);
    setSelectedText("");
  };

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPdfUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  // Ensure we have refs for all signature annotations
  useEffect(() => {
    // Create refs for any new annotations
    annotations.forEach(ann => {
      if (ann.type === "signature" && !nodeRefs.current[ann.id]) {
        nodeRefs.current[ann.id] = React.createRef<HTMLDivElement>();
      }
    });
  }, [annotations]);

  const addSignature = (dataUrl: string) => {
    const id = generateId();
    
    // Calculate center position of the current visible PDF page
    let x = 100;
    let y = 200;
    console.log("pdfContainerRef.current", pdfContainerRef.current)
    if (pdfContainerRef.current) {
      const containerRect = pdfContainerRef.current.getBoundingClientRect();
      
    console.log("pdfContainerRef.current", containerRect)
      x = containerRect.width / 2 - 75;  // Center horizontally (half of default width)
      y = containerRect.height / 3;      // Position in the top third of the document
    }
    console.log("y", -y)
    const signatureAnnotation = {
      id,
      type: "signature" as const,
      signatureDataUrl: dataUrl,
      x,
      y: -y,
      width: 150,
      height: 100,
      pageNumber: currentPage  // Store which page the signature belongs to
    };
    
    // Create a ref for the new signature
    nodeRefs.current[id] = React.createRef<HTMLDivElement>();
    
    setAnnotations((prev) => [...prev, signatureAnnotation]);
    setShowSignaturePad(false);
  };

  const updateSignaturePosition = (id: string, x: number, y: number) => {
    setAnnotations(prevAnnotations => 
      prevAnnotations.map(ann => 
        ann.id === id ? { ...ann, x, y } : ann
      )
    );
  };

  const updateSignatureSize = (id: string, width: number) => {
    // Calculate height proportionally based on original aspect ratio
    const annotation = annotations.find(ann => ann.id === id);
    if (!annotation) return;
    
    const aspectRatio = annotation.height / annotation.width;
    const newHeight = Math.round(width * aspectRatio);
    
    setAnnotations(prevAnnotations => 
      prevAnnotations.map(ann => 
        ann.id === id ? { ...ann, width, height: newHeight } : ann
      )
    );
  };

  return (
    <div>
      {file && (
        <div>
          <AnnotationToolbar
            onHighlight={() => addAnnotation("highlight")}
            onUnderline={() => addAnnotation("underline")}
            onAddComment={() => addAnnotation("comment")}
          />
          <div className="flex items-center mb-4">
            <button
              onClick={() => setShowSignaturePad(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-4"
            >
              Add Signature
            </button>
            
            {numPages && numPages > 1 && (
              <div className="flex items-center">
                <span className="mr-2">Page:</span>
                <input
                  type="number"
                  min="1"
                  max={numPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Math.min(Math.max(1, parseInt(e.target.value) || 1), numPages || 1))}
                  className="w-16 p-1 border rounded"
                />
                <span className="ml-2">of {numPages}</span>
              </div>
            )}
          </div>

          <div 
            ref={pdfContainerRef}
            onMouseUp={handleTextSelection} 
            className="border p-2 mt-4 relative"
          >
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (_, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  onRenderSuccess={onPageRenderSuccess}
                  className={index + 1 !== currentPage ? "hidden" : ""}
                />
              ))}
            </Document>
            
            {/* Render signatures on top of PDF */}
            {annotations
              .filter(ann => ann.type === "signature" && ann.pageNumber === currentPage)
              .map((signature) => {
                // Make sure we have a ref for this signature
                if (!nodeRefs.current[signature.id]) {
                  nodeRefs.current[signature.id] = React.createRef<HTMLDivElement>();
                }
                
                return (
                  <Draggable
                    key={signature.id}
                    defaultPosition={{ x: signature.x, y: signature.y }}
                    position={{ x: signature.x, y: signature.y }}
                    onStop={(e, data) => {
                      updateSignaturePosition(signature.id, data.x, data.y);
                    }}
                    bounds="parent"
                    grid={[5, 5]} // Snap to a 5px grid for more precise positioning
                    nodeRef={nodeRefs.current[signature.id]} // Pass the ref to Draggable
                  >
                    <div 
                      ref={nodeRefs.current[signature.id]} 
                      style={{
                        position: "absolute",
                        cursor: "move",
                        zIndex: 10,
                      }}
                    >
                      <img
                        src={signature.signatureDataUrl}
                        alt="Signature"
                        style={{
                          width: `${signature.width}px`,
                          height: `${signature.height}px`,
                        }}
                        draggable="false" // Prevent default image dragging behavior
                      />
                    </div>
                  </Draggable>
                );
              })}
          </div>

          {/* List Annotations */}
          <div className="mt-4">
            <h3 className="font-bold mb-2">Annotations on Page {currentPage}</h3>
            {annotations
              .filter(ann => ann.pageNumber === currentPage)
              .map((ann) => (
                <div key={ann.id} className="p-2 border rounded mb-2">
                  <strong>{ann.type.toUpperCase()}:</strong> {ann.text}

                  {/* Signature Controls */}
                  {ann.type === "signature" && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <label htmlFor={`size-slider-${ann.id}`} className="mr-2">Size:</label>
                        <input
                          id={`size-slider-${ann.id}`}
                          type="range"
                          min="50"
                          max="500"
                          value={ann.width}
                          onChange={(e) => {
                            updateSignatureSize(ann.id, parseInt(e.target.value, 10));
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2">{ann.width}px</span>
                      </div>
                      <div className="flex mt-2">
                        <button 
                          className="px-2 py-1 bg-blue-500 text-white rounded mr-2 text-sm"
                          onClick={() => {
                            if (pdfContainerRef.current) {
                              const containerRect = pdfContainerRef.current.getBoundingClientRect();
                              updateSignaturePosition(ann.id, containerRect.width / 2 - ann.width / 2, 100);
                            }
                          }}
                        >
                          Center on Page
                        </button>
                        <button 
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                          onClick={() => {
                            setAnnotations(annotations.filter(a => a.id !== ann.id));
                            // Clean up the ref when removing an annotation
                            delete nodeRefs.current[ann.id];
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <ExportButton  pdfContainerRef={pdfContainerRef}  annotations={annotations} />
        </div>
      )}

      {/* Signature Canvas Modal */}
      {showSignaturePad && (
        <SignatureCanvas
          onSave={addSignature}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
}