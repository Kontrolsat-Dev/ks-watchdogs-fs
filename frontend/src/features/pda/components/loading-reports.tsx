import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------- Loading Skeleton ---------- */
export default function LoadingReports() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-2">
            <CardTitle className="text-base md:text-lg">
              <Skeleton className="h-5 w-64" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <Skeleton className="h-9 w-full md:col-span-2" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                {["ID", "Código", "Estado", "Modo", "Data Criado", "Data Atualizado"].map(
                  (h) => (
                    <TableHead key={h}>
                      <Skeleton className="h-4 w-28" />
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

