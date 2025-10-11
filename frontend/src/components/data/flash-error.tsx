import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

interface FlashErrorProps {
  flashId: string;
  flashTitle: string;
  flashMessage: string;
  cardTitle: string;
  cardDescription: string;
  cardButtonAction: () => void;
  cardButtonText: string;
}

export default function FlashError({
  flashId,
  flashTitle,
  flashMessage,
  cardTitle,
  cardDescription,
  cardButtonAction,
  cardButtonText,
}: FlashErrorProps) {
  toast.error(flashTitle, {
    id: flashId,
    description: flashMessage,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Button variant="outline" onClick={cardButtonAction}>
          {cardButtonText}
        </Button>
      </CardContent>
    </Card>
  );
}
