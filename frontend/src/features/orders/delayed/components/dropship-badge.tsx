import { Badge } from "@/components/ui/badge";
import { Truck, StoreIcon } from "lucide-react";

export default function DropshipBadge({ v }: { v: boolean }) {
  return v ? (
    <Badge variant="secondary" className="gap-1">
      <Truck className="h-3.5 w-3.5" />
      Dropshipping
    </Badge>
  ) : (
    <Badge variant="outline">
      <StoreIcon className="h-3.5 w-3.5" />
      Loja
    </Badge>
  );
}
