import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomeHeader({
  windowStr,
  lastUpdateText,
  isFetching,
  onChangeWindow,
  onRefresh,
}: {
  windowStr: "6h" | "12h" | "24h" | "3d" | "7d";
  lastUpdateText: string;
  isFetching: boolean;
  onChangeWindow: (v: "6h" | "12h" | "24h" | "3d" | "7d") => void;
  onRefresh: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base md:text-lg">Visão Geral</CardTitle>
          <CardDescription>
            Atualizado {lastUpdateText}. Janela: {windowStr}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={windowStr}
            onValueChange={(v) => onChangeWindow(v as typeof windowStr)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Janela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">6 h</SelectItem>
              <SelectItem value="12h">12 h</SelectItem>
              <SelectItem value="24h">24 h</SelectItem>
              <SelectItem value="3d">3 dias</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className={cn(isFetching && "opacity-80")}
          >
            <RefreshCcw
              className={cn(
                "h-4 w-4",
                isFetching && "animate-spin [animation-duration:1.1s]"
              )}
            />
            <span className="sr-only">Recarregar</span>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
