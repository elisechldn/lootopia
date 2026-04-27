'use client'

import { HuntModel } from "@repo/types";
import { getHuntByStatus } from "pwa/services/hunt.service";
import { useEffect, useState } from "react";

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
  /*const [hunts, setHunts] = useState<HuntModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getHuntByStatus('ACTIVE')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setHunts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des chasses...</p>;
  if (error) return <p>Erreur : Impossible de charger les chasses.</p>;
*/
  /*return (
    <div classname="w-full">
    {hunts.map((hunt: HuntModel) => (
    <Card key={hunt.id} className="flex align-center">
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
  return ( 
  <div className="w-full">
    <Card className="flex align-center">
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 h-40 w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardTitle>Titre</CardTitle>
      </CardHeader>
      <CardDescription className="pl-4">
        <span>shortDescription</span>
        {/*<CardAction>
          Pour ajouter les rewards
        </CardAction>*/}
      </CardDescription>
      <CardFooter>
        <Button className="w-full">Participer</Button>
      </CardFooter>
    </Card>
  </div>)
}
