import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import { SurveyRow, SavedBenchmark } from "@shared/schema";
import { Trash2, Save, MapPin, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BenchmarkRowProps {
  row: SurveyRow;
  onUpdate: (id: string, data: Partial<SurveyRow>) => void;
  onDelete: (id: string) => void;
  onSaveBM: (bm: SavedBenchmark) => void;
  savedBMs: SavedBenchmark[];
  canDelete: boolean;
}

export function BenchmarkRow({ row, onUpdate, onDelete, onSaveBM, savedBMs, canDelete }: BenchmarkRowProps) {
  const [bmOpen, setBmOpen] = useState(false);

  const handleBMSelect = (bm: SavedBenchmark) => {
    onUpdate(row.id, {
      stationName: bm.name,
      knownElevation: bm.elevation,
    });
    setBmOpen(false);
  };

  const handleSaveAsBM = () => {
    if (!row.stationName || row.knownElevation == null) {
      alert('測点名と既知標高を入力してください。');
      return;
    }
    onSaveBM({
      id: crypto.randomUUID(),
      name: row.stationName,
      elevation: row.knownElevation,
      lastUsed: new Date().toISOString()
    });
    alert(`${row.stationName} を既知点として保存しました。`);
  };

  return (
    <Card 
      className="p-4 border-2 border-primary/40 bg-primary/5 shadow-lg"
      data-testid={`card-benchmark-${row.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <Badge variant="default" className="text-xs font-bold">基準点</Badge>
            <span className="text-xs text-muted-foreground ml-2">{row.setNumber}</span>
          </div>
        </div>
        
        <div className="flex gap-1">
          {row.stationName && row.knownElevation != null && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleSaveAsBM}
              title="既知点として保存"
              data-testid="button-save-benchmark"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(row.id)}
              data-testid="button-delete-benchmark"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Station Name with Autocomplete */}
      <div className="mb-4">
        <label className="text-xs font-bold text-muted-foreground mb-1.5 block">測点名</label>
        <Popover open={bmOpen} onOpenChange={setBmOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                placeholder="BM-1"
                value={row.stationName}
                onChange={(e) => onUpdate(row.id, { stationName: e.target.value })}
                className="h-12 text-lg font-bold bg-background"
                data-testid="input-benchmark-name"
              />
            </div>
          </PopoverTrigger>
          {savedBMs.length > 0 && (
            <PopoverContent className="p-0 w-64" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>見つかりません</CommandEmpty>
                  <CommandGroup heading="既知点リスト">
                    {savedBMs.map((bm) => (
                      <CommandItem key={bm.id} onSelect={() => handleBMSelect(bm)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="font-medium">{bm.name}</span>
                        <span className="ml-auto font-mono text-xs text-muted-foreground">
                          {bm.elevation.toFixed(3)}m
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>

      {/* Known Elevation & BS */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1.5 block">既知標高 (m)</label>
          <NumberInput
            placeholder="100.000"
            value={row.knownElevation}
            onValueChange={(val) => onUpdate(row.id, { knownElevation: val })}
            className="h-12 text-lg font-mono bg-background"
            data-testid="input-known-elevation"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1.5 block">BS 後視 (m)</label>
          <NumberInput
            placeholder="1.500"
            value={row.bs}
            onValueChange={(val) => onUpdate(row.id, { bs: val })}
            className="h-12 text-lg font-mono bg-background"
            data-testid="input-benchmark-bs"
          />
        </div>
      </div>

      {/* Calculated HI Display */}
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-primary/80">HI 器械高</label>
            <p className="text-xs text-muted-foreground mt-0.5">= 既知標高 + BS</p>
          </div>
          <div className={cn(
            "text-2xl font-mono font-bold",
            row.hi != null ? "text-primary" : "text-muted-foreground"
          )}>
            {row.hi != null ? `${row.hi.toFixed(3)} m` : "—"}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4">
        <Input
          placeholder="備考"
          value={row.note || ""}
          onChange={(e) => onUpdate(row.id, { note: e.target.value })}
          className="h-10 bg-transparent border-dashed"
          data-testid="input-benchmark-note"
        />
      </div>
    </Card>
  );
}
