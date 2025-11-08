import { cn } from "@/lib/utils";

export default function SectionTitle({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <div className="text-sm font-medium leading-none">{title}</div>
        {description ? (
          <div className="text-xs text-muted-foreground">{description}</div>
        ) : null}
      </div>
    </div>
  );
}
