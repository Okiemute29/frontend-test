"use client"
import { useState } from 'react';
import DocumentUploader from './components/DocumentUploader';
import PDFViewer from './components/PDFViewer';
import AnnotationToolbar from './components/AnnotationToolbar';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };


  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Annotation Tool</h1>
      <DocumentUploader onFileUpload={handleFileUpload} />
      {uploadedFile && (
        <div className="mt-4">
          <PDFViewer file={uploadedFile} />
        </div>
      )}
    </main>
  );
}
