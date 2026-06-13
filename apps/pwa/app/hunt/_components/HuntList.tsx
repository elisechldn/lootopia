"use client";

import { HuntModel } from "@repo/types";
import { getHuntByStatus } from "pwa/services/hunt.service";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function HuntList() {
  const [hunts, setHunts] = useState<HuntModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getHuntByStatus("ACTIVE")
      .then((res) => {
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

  return (
    <div className="w-full">
      {hunts.map((hunt: HuntModel) => (
        <Card key={hunt.id} className="flex align-center">
          <CardHeader>
            <CardTitle>{hunt.title}</CardTitle>
          </CardHeader>
          <CardDescription>
            <span className="flex items-center gap-2">
              {hunt.shortDescription}
            </span>
            <CardAction>
              <Trophy size={11} />
              <span className="truncate">{hunt.rewardValue}</span>
            </CardAction>
          </CardDescription>
          <CardFooter>
            <Link href={`/hunts/${hunt.id}`}>
              <Button className="w-full text-center">Participer</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
