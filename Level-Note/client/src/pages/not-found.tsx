import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive font-bold text-xl items-center">
            <AlertCircle className="w-8 h-8" />
            404 Page Not Found
          </div>

          <p className="mt-4 text-sm text-gray-600">
            ページが見つかりませんでした。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
