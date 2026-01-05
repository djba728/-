import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import { SurveyRow } from "@shared/schema";
import { Trash2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForesightRowProps {
  row: SurveyRow;
  rowIndex: number;
  currentHI: number | null;
  onUpdate: (id: string, data: Partial<SurveyRow>) => void;
  onDelete: (id: string) => void;
  validateFS: (fs: number) => string | null;
}

export function ForesightRow({ row, rowIndex, currentHI, onUpdate, onDelete, validateFS }: ForesightRowProps) {
  const handleFSChange = (val: number | null) => {
    onUpdate(row.id, { fs: val });
    if (val != null) {
      const warning = validateFS(val);
      if (warning) {
        alert(warning);
      }
    }
  };

  return (
    <Card 
      className="p-4 border-l-4 border-l-accent bg-card shadow-sm"
      data-testid={`card-foresight-${row.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full font-mono text-sm">
            {rowIndex}
          </Badge>
          <div className="flex items-center gap-1.5">
            <CircleDot className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-[10px]">FS</Badge>
          </div>
        </div>
        
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(row.id)}
          data-testid="button-delete-foresight"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Station Name & FS Input */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">測点名</label>
          <Input
            placeholder="No.1"
            value={row.stationName}
            onChange={(e) => onUpdate(row.id, { stationName: e.target.value })}
            className="h-11 font-bold bg-background"
            data-testid="input-foresight-name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">FS 前視 (m)</label>
          <NumberInput
            placeholder="1.234"
            value={row.fs}
            onValueChange={handleFSChange}
            className="h-11 font-mono bg-background"
            data-testid="input-foresight-fs"
          />
        </div>
      </div>

      {/* Calculated Elevation */}
      <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">標高</label>
          <p className="text-[10px] text-muted-foreground">= HI - FS</p>
        </div>
        <div className="text-right">
          {currentHI != null && (
            <p className="text-[10px] text-muted-foreground font-mono mb-0.5">
              HI: {currentHI.toFixed(3)}
            </p>
          )}
          <div className={cn(
            "text-xl font-mono font-bold",
            row.elevation != null ? "text-foreground" : "text-muted-foreground"
          )}>
            {row.elevation != null ? `${row.elevation.toFixed(3)} m` : "—"}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-3">
        <Input
          placeholder="備考"
          value={row.note || ""}
          onChange={(e) => onUpdate(row.id, { note: e.target.value })}
          className="h-9 text-sm bg-transparent border-dashed border-muted-foreground/20"
          data-testid="input-foresight-note"
        />
      </div>
    </Card>
  );
}
