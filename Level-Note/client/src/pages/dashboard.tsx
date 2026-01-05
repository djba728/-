import { useEffect, useRef } from 'react';
import { useSurveyStore } from "@/hooks/use-survey-store";
import { useTheme } from "@/hooks/use-theme";
import { BenchmarkRow } from "@/components/benchmark-row";
import { ForesightRow } from "@/components/foresight-row";
import { CsvExporter } from "@/components/csv-exporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Moon, Sun, Trash2, BookOpen, Target, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const {
    session,
    savedBMs,
    updateSessionField,
    addBenchmark,
    addForesight,
    updateRow,
    deleteRow,
    saveBenchmark,
    clearSession,
    getCurrentHI,
    validateFS,
    isLoaded
  } = useSurveyStore();

  const { theme, toggleTheme } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentHI = getCurrentHI();
  const hasBenchmark = session.rows.some(r => r.type === 'benchmark');
  const canAddFS = currentHI != null;

  useEffect(() => {
    if (session.rows.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [session.rows.length]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  // Count FS rows for numbering
  let fsIndex = 0;

  return (
    <div className="min-h-screen bg-muted/20 pb-32 sm:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight">水準測量計算</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">HI方式</p>
            </div>
          </div>

          {/* Current HI Display */}
          {currentHI != null && (
            <div className="flex-1 flex justify-center">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 px-3 py-1">
                <span className="text-[10px] text-muted-foreground mr-1.5">HI:</span>
                <span className="font-mono font-bold text-primary">{currentHI.toFixed(3)}</span>
              </Badge>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">

        {/* Project Info */}
        <Card className="border-none shadow-md bg-card">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              作業情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">現場名</label>
              <Input
                value={session.siteName}
                onChange={(e) => updateSessionField('siteName', e.target.value)}
                placeholder="○○工事現場"
                className="bg-muted/30"
                data-testid="input-site-name"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">日付</label>
              <Input
                type="date"
                value={session.date}
                onChange={(e) => updateSessionField('date', e.target.value)}
                className="bg-muted/30"
                data-testid="input-date"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">作業者名</label>
              <Input
                value={session.surveyor}
                onChange={(e) => updateSessionField('surveyor', e.target.value)}
                placeholder="山田太郎"
                className="bg-muted/30"
                data-testid="input-surveyor"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex gap-2 sticky top-16 z-40 bg-muted/20 py-2 -mx-4 px-4">
          <CsvExporter session={session} />
          <Button
            variant="outline"
            className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive w-12 px-0"
            onClick={clearSession}
            title="全消去"
            data-testid="button-clear-all"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        {/* Survey Rows */}
        <div className="space-y-4">
          {session.rows.length === 0 ? (
            <Alert className="bg-muted/30 border-dashed border-2">
              <Target className="h-4 w-4" />
              <AlertTitle className="font-bold text-primary mb-1">野帳が空です</AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm">
                「基準点を追加」ボタンを押して、最初の既知点（BM）を入力してください。
              </AlertDescription>
            </Alert>
          ) : (
            session.rows.map((row) => {
              if (row.type === 'benchmark') {
                return (
                  <BenchmarkRow
                    key={row.id}
                    row={row}
                    onUpdate={updateRow}
                    onDelete={deleteRow}
                    onSaveBM={saveBenchmark}
                    savedBMs={savedBMs}
                    canDelete={session.rows.filter(r => r.type === 'benchmark').length > 1}
                  />
                );
              } else {
                fsIndex++;
                return (
                  <ForesightRow
                    key={row.id}
                    row={row}
                    rowIndex={fsIndex}
                    currentHI={currentHI}
                    onUpdate={updateRow}
                    onDelete={deleteRow}
                    validateFS={validateFS}
                  />
                );
              }
            })
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/40 p-4 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          {!hasBenchmark && (
            <Button
              size="lg"
              onClick={addBenchmark}
              className="flex-1 h-14 rounded-xl shadow-lg shadow-primary/20 gap-2"
              data-testid="button-add-benchmark"
            >
              <Target className="w-5 h-5" />
              <span className="font-bold">基準点を追加</span>
            </Button>
          )}

          {hasBenchmark && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={addBenchmark}
                className="h-14 px-4 rounded-xl border-primary/30"
                data-testid="button-add-benchmark-secondary"
              >
                <Target className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                onClick={addForesight}
                disabled={!canAddFS}
                className="flex-1 h-14 rounded-xl shadow-lg shadow-primary/20 gap-2"
                data-testid="button-add-foresight"
              >
                <CircleDot className="w-5 h-5" />
                <span className="font-bold">FS点を追加</span>
              </Button>
            </>
          )}
        </div>

        {hasBenchmark && !canAddFS && (
          <p className="text-center text-xs text-destructive mt-2">
            基準点のBS（後視）を入力してください
          </p>
        )}
      </div>
    </div>
  );
}
