import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionTitle from "./section-title";
import { TriangleAlert } from "lucide-react";

export default function BackendErrorsCard({
  errors,
}: {
  errors?: Record<string, string | null>;
}) {
  if (!errors || !Object.values(errors).some(Boolean)) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={TriangleAlert}
          title="Erros"
          description="Secções com problemas"
        />
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {Object.entries(errors)
          .filter(([, msg]) => !!msg)
          .map(([key, msg]) => (
            <div key={key} className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">{key}</div>
              <div className="font-medium">{msg}</div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
