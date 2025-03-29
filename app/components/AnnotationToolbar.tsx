"use client";

interface AnnotationToolbarProps {
  onHighlight: () => void;
  onUnderline: () => void;
  onAddComment: () => void;
}

export default function AnnotationToolbar({
  onHighlight,
  onUnderline,
  onAddComment,
}: AnnotationToolbarProps) {
  return (
    <div className="flex justify-center gap-4 p-2 bg-gray-100 rounded-lg mb-4">
      <button
        onClick={onHighlight}
        className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
      >
        Highlight
      </button>

      <button
        onClick={onUnderline}
        className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500"
      >
        Underline
      </button>

      <button
        onClick={onAddComment}
        className="px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-500"
      >
        Add Comment
      </button>
    </div>
  );
}
