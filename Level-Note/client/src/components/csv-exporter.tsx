import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SurveySession } from "@shared/schema";

interface CsvExporterProps {
  session: SurveySession;
  disabled?: boolean;
}

/**
 * HI方式対応のCSV出力
 * 外部ライブラリ不使用（Blob + downloadリンク方式）
 * 
 * CSV項目順:
 * 現場名, 日付, 作業者名, 据付番号, 種別, 測点名, 既知標高, BS, FS, HI, 標高, 備考
 */
export function CsvExporter({ session, disabled }: CsvExporterProps) {
  const handleExport = () => {
    // 1. Header Row
    const headers = [
      "現場名",
      "日付",
      "作業者名",
      "据付番号",
      "種別",
      "測点名",
      "既知標高",
      "BS",
      "FS",
      "HI",
      "標高",
      "備考"
    ];

    // 2. Data Rows
    const rows = session.rows.map(row => {
      const type = row.type === 'benchmark' ? '基準点' : 'FS';
      return [
        escapeCSV(session.siteName),
        session.date,
        escapeCSV(session.surveyor),
        escapeCSV(row.setNumber),
        type,
        escapeCSV(row.stationName),
        row.knownElevation != null ? row.knownElevation.toFixed(3) : "",
        row.bs != null ? row.bs.toFixed(3) : "",
        row.fs != null ? row.fs.toFixed(3) : "",
        row.hi != null ? row.hi.toFixed(3) : "",
        row.elevation != null ? row.elevation.toFixed(3) : "",
        escapeCSV(row.note || "")
      ];
    });

    // 3. Construct CSV String
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // 4. Create Blob with BOM for Excel compatibility (UTF-8 BOM付き)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

    // 5. Generate Filename: 水準測量野帳_現場名_YYYYMMDD.csv
    const safeSiteName = session.siteName.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/gi, '_') || 'Site';
    const dateStr = session.date.replace(/-/g, '');
    const filename = `水準測量野帳_${safeSiteName}_${dateStr}.csv`;

    // 6. Download using Blob URL (外部ライブラリ不使用)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || session.rows.length === 0}
      className="flex-1 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
      data-testid="button-csv-export"
    >
      <Download className="w-4 h-4" />
      CSV出力
    </Button>
  );
}

// Helper to escape CSV values with commas or quotes
function escapeCSV(value: string): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
