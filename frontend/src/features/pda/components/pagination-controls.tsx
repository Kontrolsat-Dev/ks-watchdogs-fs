import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/api/tools/types";

interface PaginationControlsProps {
  page: number;
  pageSize: 10 | 25 | 50;
  meta: Pagination | null;
  currentItemsCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: 10 | 25 | 50) => void;
  onScrollTop?: () => void;
}

export default function PaginationControls({
  page,
  pageSize,
  meta,
  currentItemsCount = 0,
  onPageChange,
  onPageSizeChange,
  onScrollTop,
}: PaginationControlsProps) {
  const total = meta?.total ?? 0;
  const hasNext = meta?.has_next ?? false;
  const hasPrev = meta?.has_prev ?? false;
  const totalPages = meta && total > 0 ? Math.ceil(total / pageSize) : 1;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end =
    currentItemsCount > 0
      ? (page - 1) * pageSize + currentItemsCount
      : Math.min((page - 1) * pageSize + pageSize, total);

  const handlePrev = () => {
    const newPage = page - 1;
    if (newPage >= 1) {
      onPageChange(newPage);
      onScrollTop?.();
    }
  };

  const handleNext = () => {
    const newPage = page + 1;
    onPageChange(newPage);
    onScrollTop?.();
  };

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value) as 10 | 25 | 50);
    onPageChange(1);
    onScrollTop?.();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Página <span className="font-medium text-foreground">{page}</span>
        {meta && (
          <>
            {" "}
            de <span className="font-medium text-foreground">{totalPages}</span>
          </>
        )}
        {" · "}A mostrar{" "}
        <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> de{" "}
        <span className="font-medium text-foreground">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / página</SelectItem>
            <SelectItem value="25">25 / página</SelectItem>
            <SelectItem value="50">50 / página</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[4.5rem] text-center text-sm">
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={meta !== null && !hasNext}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
