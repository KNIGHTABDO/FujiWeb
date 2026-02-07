"use client";

import { useFilmStore } from "@/store/filmStore";
import { 
  Trash2, 
  Download, 
  Layers,
  Sparkles
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export function Controls() {
  const { 
    imageUrl, 
    exposure, 
    grainStrength, 
    halationIntensity,
    setParam,
    setImageUrl 
  } = useFilmStore();

  if (!imageUrl) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 w-80 z-50 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Fuji Simulation Engine
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800"
            onClick={() => setImageUrl("")}
          >
            <Trash2 size={14} />
          </Button>
        </div>

        {/* AI Stats / Simulation Meta */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
           <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Profile</p>
              <p className="text-xs font-medium text-zinc-200">Classic Chrome</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Processing</p>
              <p className="text-xs font-medium text-orange-500/80 italic">Real-time GL</p>
           </div>
        </div>

        {/* Section: Light Physics */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Optical Physics</span>
          </div>

          <ControlGroup 
            label="Luminance" 
            value={exposure} 
            min={-2} 
            max={2} 
            step={0.01}
            onChange={(v) => setParam("exposure", v)} 
          />
          
          <ControlGroup 
            label="Scattering" 
            value={halationIntensity} 
            min={0} 
            max={2} 
            step={0.01}
            onChange={(v) => setParam("halationIntensity", v)} 
          />
        </div>

        {/* Section: Chemistry */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <Layers size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Grain Chemistry</span>
          </div>

          <ControlGroup 
            label="Crystal Size" 
            value={grainStrength} 
            min={0} 
            max={0.5} 
            step={0.001}
            onChange={(v) => setParam("grainStrength", v)} 
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex gap-2">
           <Button className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-xs h-11">
              <Download size={14} className="mr-2" />
              Save Master
           </Button>
        </div>

      </div>

      {/* Subtle Bottom Badge */}
      <div className="mt-4 flex justify-center">
         <div className="px-3 py-1 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-full">
            <p className="text-[9px] text-zinc-600 font-medium tracking-tight">
              Math-driven Nostalgia Pipeline v1.0
            </p>
         </div>
      </div>
    </div>
  );
}

function ControlGroup({ label, value, min, max, step, onChange }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] font-mono text-zinc-500 tabular-nums">{(value > 0 ? "+" : "") + value.toFixed(2)}</span>
      </div>
      <Slider
        defaultValue={[value]}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-orange-500 [&_[role=slider]]:bg-zinc-950"
      />
    </div>
  );
}
