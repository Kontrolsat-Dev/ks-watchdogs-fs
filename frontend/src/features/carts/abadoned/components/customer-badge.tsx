import { User, UserX } from "lucide-react";

export default function CustomerBadge({ id }: { id: number }) {
  const isGuest = !id || id === 0;
  return isGuest ? (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <UserX className="h-4 w-4" /> Guest
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <User className="h-4 w-4" /> {id}
    </span>
  );
}
