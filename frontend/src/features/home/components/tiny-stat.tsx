import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TinyStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-muted-foreground" /> : null}
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
