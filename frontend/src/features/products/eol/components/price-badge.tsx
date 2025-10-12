import { Tag } from "lucide-react";

export default function PriceBadge({ hasPrice }: { hasPrice: boolean }) {
  return hasPrice ? (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground border border-border">
      <Tag className="h-3.5 w-3.5" />
      Com preço
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border">
      <Tag className="h-3.5 w-3.5" />
      Sem preço
    </span>
  );
}
