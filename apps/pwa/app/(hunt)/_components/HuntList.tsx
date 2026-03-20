import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function HuntList() {
  return (
    <div>
    {hunts.map((hunt) => (
    <Card key={hunt.id} className="w-sm">
      <CardHeader>
        <CardTitle>{hunt.title}</CardTitle>
      </CardHeader>
      <CardDescription>
        <span className="flex items-center gap-2">{hunt.shortDescription}</span>
        <CardAction>

        </CardAction>
      </CardDescription>
      <CardFooter>
        <Button className="w-full">Participer</Button>
      </CardFooter>
    </Card>
    ))}
  </div>
  );
}
