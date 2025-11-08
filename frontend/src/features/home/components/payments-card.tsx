import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionTitle from "./section-title";
import { CreditCard } from "lucide-react";
import type { PaymentsKpi } from "@/api/home";
import { formatDate } from "@/helpers/time";

export default function PaymentsCard({ kpi }: { kpi?: PaymentsKpi }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <SectionTitle
          icon={CreditCard}
          title="Pagamentos"
          description="Último pagamento por método"
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {!kpi || kpi.last_per_method.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Sem registos para a janela selecionada.
          </div>
        ) : (
          <div className="relative overflow-auto subtle-scroll">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="text-muted-foreground">
                  <th className="text-left p-2 font-medium">Método</th>
                  <th className="text-left p-2 font-medium">Último</th>
                  <th className="text-left p-2 font-medium">Idade</th>
                </tr>
              </thead>
              <tbody>
                {kpi.last_per_method.map((m) => (
                  <tr key={m.method} className="border-b last:border-0">
                    <td className="p-2">{m.method}</td>
                    <td className="p-2">
                      {m.last_payment_at ? formatDate(m.last_payment_at) : "—"}
                    </td>
                    <td className="p-2">
                      {m.age_minutes != null ? `${m.age_minutes} min` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
