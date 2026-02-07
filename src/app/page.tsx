'use client';

import FujiCanvas from "@/components/canvas/FujiCanvas";
import { Controls } from "@/components/ui/controls";
import { useFilmStore } from "@/store/filmStore";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const setImageUrl = useFilmStore((state) => state.setImageUrl);
  const imageUrl = useFilmStore((state) => state.imageUrl);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  }, [setImageUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: !!imageUrl, // Disable click to open dialog if image is loaded
    noKeyboard: true 
  });

  return (
    <main className="flex h-screen w-full flex-row overflow-hidden bg-black text-white" {...getRootProps()}>
      <input {...getInputProps()} className="hidden" />
      
      {/* Viewport Area */}
      <div className="relative flex-1 bg-zinc-950">
        <FujiCanvas />

        {/* Drag Overlay */}
        {isDragActive && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-orange-500/10 backdrop-blur-sm border-2 border-orange-500 border-dashed m-4 rounded-xl">
             <p className="text-2xl font-bold text-orange-500">DROP TO LOAD ROLL</p>
           </div>
        )}
      </div>

      {/* Controls Sidebar */}
      <Controls />
    </main>
  );
}
