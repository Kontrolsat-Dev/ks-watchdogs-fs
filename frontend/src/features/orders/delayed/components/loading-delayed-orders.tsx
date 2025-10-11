import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROWS = 8;

function TableHeaderSkeleton() {
  // tamanhos aproximados às tuas colunas reais
  const widths = [
    "w-[140px]",
    "w-[200px]",
    "w-[140px]",
    "w-[120px]",
    "w-[100px]",
    "w-[190px]",
    "w-[140px]",
  ];
  return (
    <TableHeader>
      <TableRow>
        {widths.map((w, i) => (
          <TableHead key={i}>
            <Skeleton className={cn("h-4", w)} />
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function TableRowSkeleton({ index }: { index: number }) {
  return (
    <TableRow key={index}>
      {/* Encomenda (duas linhas: id + referência) */}
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      </TableCell>

      {/* Estado (duas linhas) */}
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>

      {/* Dropshipping (badge) */}
      <TableCell>
        <Skeleton className="h-6 w-28 rounded-full" />
      </TableCell>

      {/* Dias Passados */}
      <TableCell>
        <Skeleton className="h-4 w-10" />
      </TableCell>

      {/* Nível (pill) */}
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>

      {/* Data de Encomenda */}
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>

      {/* Analisado */}
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

export default function LoadingDelayedOrders() {
  return (
    <div className="flex flex-col gap-4">
      {/* Card topo: título + filtros + refresh */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-2">
            <CardTitle className="text-base md:text-lg">
              <Skeleton className="h-5 w-56" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </div>
          {/* botão refresh */}
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>

        {/* filtros: search + 2 selects */}
        <CardContent className="grid gap-2 md:grid-cols-3">
          <Skeleton className="h-9 w-full md:col-span-1" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeaderSkeleton />
            <TableBody>
              {Array.from({ length: ROWS }).map((_, i) => (
                <TableRowSkeleton key={i} index={i} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
