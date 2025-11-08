import { useMemo, useState } from "react";
import { useHomeSummary } from "./queries";
import type { HomeSummary, HomeKpis, CheckCard } from "@/api/home";
import { timeAgo } from "@/helpers/time";

// components
import HomeHeader from "./components/home-header";
import ChecksGrid from "./components/checks-grid";
import QuickKpis from "./components/quick-kpis";
import PaymentsCard from "./components/payments-card";
import OrdersDelayedCard from "./components/orders-delayed-card";
import PagespeedCard from "./components/pagespeed-card";
import CartsCard from "./components/carts-card";
import EolCard from "./components/eol-card";
import BackendErrorsCard from "./components/backend-errors-card";

export default function HomePage() {
  const [windowStr, setWindowStr] = useState<
    "6h" | "12h" | "24h" | "3d" | "7d"
  >("24h");

  const { data, isFetching, isError, refetch } = useHomeSummary(windowStr) as {
    data?: HomeSummary;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const lastUpdate = data?.last_update_iso
    ? timeAgo(data.last_update_iso)
    : "—";

  const checks: CheckCard[] = useMemo(() => {
    const arr = data?.checks ?? [];
    return arr.slice().sort((a, b) => a.name.localeCompare(b.name, "pt-PT"));
  }, [data]);

  const kpis: HomeKpis = data?.kpis ?? {};

  return (
    <div className="flex flex-col gap-4">
      <HomeHeader
        windowStr={windowStr}
        lastUpdateText={lastUpdate}
        isFetching={isFetching}
        onChangeWindow={(w) => setWindowStr(w)}
        onRefresh={() => refetch()}
      />

      <ChecksGrid checks={checks} loading={isFetching && checks.length === 0} />

      <QuickKpis
        orders={kpis.orders_delayed}
        carts={kpis.carts_stale}
        pagespeed={kpis.pagespeed}
      />

      <PaymentsCard kpi={kpis.payments} />

      <OrdersDelayedCard kpi={kpis.orders_delayed} />

      <PagespeedCard kpi={kpis.pagespeed} />

      <div className="grid gap-3 lg:grid-cols-2">
        <CartsCard kpi={kpis.carts_stale} />
        <EolCard kpi={kpis.eol} />
      </div>

      <BackendErrorsCard errors={data?.errors} />

      {isError ? (
        <div className="text-sm text-red-500">
          Erro ao carregar dados da Home. Tenta recarregar.
        </div>
      ) : null}
    </div>
  );
}
