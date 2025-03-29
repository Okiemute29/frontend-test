import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploaderProps {
  onFileUpload: (file: File) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log("File object:", file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full h-64 border-2 border-dashed rounded-lg p-4
        flex justify-center items-center cursor-pointer
        ${isDragActive ? 'border-green-500 bg-green-100' : 'border-gray-400'}
      `}
    >
      <input {...getInputProps()} />
      <p>{isDragActive ? 'Drop the file here...' : 'Drag and drop a PDF file or click to select'}</p>
    </div>
  );
};

export default DocumentUploader;

