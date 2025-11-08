import TinyStat from "./tiny-stat";
import { Gauge, TrendingUp, Package, Database } from "lucide-react";
import type { OrdersDelayedKpi, CartsStaleKpi, PagespeedKpi } from "@/api/home";

export default function QuickKpis({
  orders,
  carts,
  pagespeed,
}: {
  orders?: OrdersDelayedKpi;
  carts?: CartsStaleKpi;
  pagespeed?: PagespeedKpi;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <TinyStat
        label="Encomendas atrasadas"
        value={orders ? orders.total : "—"}
        icon={Package}
      />
      <TinyStat
        label="Atraso 24 h"
        value={orders ? orders.delta_24h : "—"}
        icon={TrendingUp}
      />
      <TinyStat
        label="Carrinhos acima do limite"
        value={carts ? carts.over_threshold : "—"}
        icon={Database}
      />
      <TinyStat
        label="TTFB Home p50"
        value={pagespeed ? `${pagespeed.home.p50_ttfb_ms} ms` : "—"}
        icon={Gauge}
      />
      <TinyStat
        label="TTFB Produto p50"
        value={pagespeed ? `${pagespeed.product.p50_ttfb_ms} ms` : "—"}
        icon={Gauge}
      />
    </div>
  );
}
