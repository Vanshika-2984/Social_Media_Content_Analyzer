"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadDropzone({ onFileSelected, disabled }: { onFileSelected: (file: File) => void, disabled?: boolean }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) onFileSelected(acceptedFiles[0]);
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: (parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "10", 10)) * 1024 * 1024
  });

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${isDragActive ? "border-blue-400 bg-blue-900/20" : "border-slate-600 bg-slate-800/30"}`}>
      <input {...getInputProps()} />
      <p className="mb-2">Drag & drop a file here, or click to select</p>
      <p className="text-slate-400 text-sm">We process files in-memory and do not persist uploads.</p>
    </div>
  );
}
