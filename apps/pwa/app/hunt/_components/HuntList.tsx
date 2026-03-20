import { HuntModel } from "@repo/types";
import { getHuntByStatus } from "pwa/services/hunt.service";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



export async function HuntList() {
  /*const hunts = await getHuntByStatus('').then(res => res.data) as HuntModel[];

  return (
    <div>
    {hunts.map((hunt: HuntModel) => (
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
  );*/
  return ( <div>
    <Card className="w-sm">
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardTitle>Titre</CardTitle>
      </CardHeader>
      <CardDescription>
        <span className="flex items-center gap-2">shortDescription</span>
        <CardAction>

        </CardAction>
      </CardDescription>
      <CardFooter>
        <Button className="w-full">Participer</Button>
      </CardFooter>
    </Card>
  </div>)
}
