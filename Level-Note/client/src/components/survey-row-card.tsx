import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import { SurveyRow, SavedBenchmark } from "@shared/schema";
import { Trash2, Save, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SurveyRowCardProps {
  row: SurveyRow;
  isFirst: boolean;
  onUpdate: (id: string, data: Partial<SurveyRow>) => void;
  onDelete: (id: string) => void;
  onSaveBM: (bm: SavedBenchmark) => void;
  savedBMs: SavedBenchmark[];
}

export function SurveyRowCard({ row, isFirst, onUpdate, onDelete, onSaveBM, savedBMs }: SurveyRowCardProps) {
  const [bmOpen, setBmOpen] = useState(false);

  const handleBMSelect = (bm: SavedBenchmark) => {
    onUpdate(row.id, { 
      stationName: bm.name, 
      elevation: bm.elevation,
      isBenchmark: true
    });
    setBmOpen(false);
  };

  const handleSaveAsBM = () => {
    if (!row.stationName || row.elevation === null || row.elevation === undefined) return;
    onSaveBM({
      id: crypto.randomUUID(),
      name: row.stationName,
      elevation: row.elevation,
      lastUsed: new Date().toISOString()
    });
    // Visual feedback handled by parent or toast?
    onUpdate(row.id, { isBenchmark: true });
  };

  return (
    <Card className={cn(
      "p-4 mb-3 border-l-4 shadow-sm transition-all duration-200", 
      row.isBenchmark ? "border-l-primary bg-primary/5" : "border-l-transparent"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full bg-background font-mono">
             {row.rowNumber}
           </Badge>
           
           {/* Station Name with Autocomplete */}
           <Popover open={bmOpen} onOpenChange={setBmOpen}>
             <PopoverTrigger asChild>
               <div className="relative w-32 sm:w-48">
                 <Input 
                   placeholder="測点 (BM/No.)" 
                   value={row.stationName} 
                   onChange={(e) => onUpdate(row.id, { stationName: e.target.value })}
                   className={cn("h-9 font-bold", row.isBenchmark && "text-primary")}
                 />
               </div>
             </PopoverTrigger>
             <PopoverContent className="p-0 w-52" align="start">
               <Command>
                 <CommandInput placeholder="既知点検索..." />
                 <CommandList>
                   <CommandEmpty>見つかりません</CommandEmpty>
                   <CommandGroup heading="既知点 (Benchmarks)">
                     {savedBMs.map((bm) => (
                       <CommandItem key={bm.id} onSelect={() => handleBMSelect(bm)}>
                         <MapPin className="mr-2 h-4 w-4" />
                         <span>{bm.name}</span>
                         <span className="ml-auto font-mono text-xs">{bm.elevation.toFixed(3)}m</span>
                       </CommandItem>
                     ))}
                   </CommandGroup>
                 </CommandList>
               </Command>
             </PopoverContent>
           </Popover>

           {row.isBenchmark && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">BM</Badge>}
        </div>

        <div className="flex gap-1">
          {/* Quick Save as BM button */}
          {row.stationName && row.elevation != null && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleSaveAsBM}
              title="既知点として保存"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          
          {!isFirst && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(row.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">BS (後視)</label>
          <NumberInput 
            placeholder="0.000"
            value={row.bs}
            onValueChange={(val) => onUpdate(row.id, { bs: val })}
            className="bg-background"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">FS (前視)</label>
          <NumberInput 
            placeholder="0.000"
            value={row.fs}
            onValueChange={(val) => onUpdate(row.id, { fs: val })}
            className="bg-background"
            disabled={isFirst /* Usually first point is start BM, no FS taken on it in this row structure? */} 
            /* Wait, if Row 1 is Start BM, we only need to enter its Elevation. 
               The NEXT row will have BS/FS. 
               But user requirements say "Delta H = BS - FS".
               If we are in "Simple Mode", maybe we allow inputs everywhere.
               Let's enable FS even on first row just in case user uses diff workflow.
            */
            disabled={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
        <div>
           <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 block">Delta H</label>
           <div className={cn(
             "text-lg font-mono font-medium",
             (row.deltaH || 0) > 0 ? "text-emerald-600 dark:text-emerald-400" : 
             (row.deltaH || 0) < 0 ? "text-rose-600 dark:text-rose-400" : ""
           )}>
             {row.deltaH != null ? (row.deltaH > 0 ? "+" : "") + row.deltaH.toFixed(3) : "—"}
           </div>
        </div>
        <div>
           <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 block">Elevation (標高)</label>
           <div className="flex items-center gap-2">
             {isFirst ? (
               // First row elevation is editable (Datum)
               <NumberInput 
                 value={row.elevation} 
                 onValueChange={(val) => onUpdate(row.id, { elevation: val, isBenchmark: true })}
                 className="h-8 text-lg font-bold bg-transparent border-0 border-b border-dashed border-muted-foreground/30 rounded-none px-0 text-right focus-visible:ring-0 focus-visible:border-primary"
                 placeholder="Datum..."
               />
             ) : (
               <span className="text-lg font-mono font-bold">
                 {row.elevation != null ? row.elevation.toFixed(3) : "—"}
               </span>
             )}
             <span className="text-xs text-muted-foreground self-end mb-1">m</span>
           </div>
        </div>
      </div>
      
      <div className="mt-3">
        <Input 
          placeholder="備考 (Note)" 
          value={row.note || ""}
          onChange={(e) => onUpdate(row.id, { note: e.target.value })}
          className="h-8 text-sm bg-transparent border-transparent hover:border-border focus:border-primary transition-colors placeholder:text-muted-foreground/50"
        />
      </div>
    </Card>
  );
}
