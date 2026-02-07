'use client';

import { useFilmStore } from "@/store/filmStore";
import { SlidersHorizontal, Image as ImageIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ControlGroupProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number[]) => void;
}

export function Controls() {
  const { 
    exposure, contrast, grainStrength, 
    grainScale, halationIntensity, halationThreshold,
    setParam 
  } = useFilmStore();

  return (
    <div className="flex h-full w-80 flex-col gap-6 border-l border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-orange-500" />
        <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
          Dev Process
        </h2>
      </div>

      <div className="space-y-4">
        <ControlGroup label="Exposure" value={exposure} min={-2.0} max={2.0} step={0.1}
          onChange={(v: number[]) => setParam('exposure', v[0])} 
        />
        <ControlGroup label="Contrast" value={contrast} min={0.5} max={2.0} step={0.1}
          onChange={(v: number[]) => setParam('contrast', v[0])} 
        />
      </div>

      <div className="h-px bg-zinc-800" />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">FILM PHYSICS</span>
        </div>
        
        <ControlGroup label="Grain Strength" value={grainStrength} min={0.0} max={1.0} step={0.05}
          onChange={(v: number[]) => setParam('grainStrength', v[0])} 
        />
        <ControlGroup label="Grain Scale" value={grainScale} min={0.5} max={5.0} step={0.1}
          onChange={(v: number[]) => setParam('grainScale', v[0])} 
        />
        
        <ControlGroup label="Halation Strength" value={halationIntensity} min={0.0} max={2.0} step={0.1}
          onChange={(v: number[]) => setParam('halationIntensity', v[0])} 
        />
         <ControlGroup label="Halation Thresh" value={halationThreshold} min={0.5} max={1.0} step={0.01}
          onChange={(v: number[]) => setParam('halationThreshold', v[0])} 
        />
      </div>
    </div>
  );
}

function ControlGroup({ label, value, min, max, step, onChange }: ControlGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <span className="text-xs font-mono text-zinc-500">{value.toFixed(2)}</span>
      </div>
      <Slider
        defaultValue={[value]}
        max={max}
        min={min}
        step={step}
        onValueChange={onChange}
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
      />
    </div>
  );
}
