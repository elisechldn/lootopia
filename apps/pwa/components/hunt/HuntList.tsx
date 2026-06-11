"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Trophy } from "lucide-react";
import type { NearbyHunt } from "@/services/hunt.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDist(meters: number | null): string | null {
  if (meters == null) return null;
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

export function HuntList({ hunts, ref }: HuntListProps) {
  return (
    <Card key={hunt.id} className="flex align-center">
      <CardHeader>
        <div className="h-24 bg-muted relative">
          {hunt.coverImage && (
            <Image
              src={hunt.coverImage}
              alt={hunt.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          {dist && (
            <span className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
              <MapPin size={10} /> {dist}
            </span>
          )}
          <CardTitle>{hunt.title}</CardTitle>
        </div>
      </CardHeader>
      <CardDescription>
        <span className="flex items-center gap-2">{hunt.shortDescription}</span>
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
  );
}

export function HuntList({ hunts }: { hunts: NearbyHunt[] }) {
  if (hunts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <MapPin size={40} className="text-muted-foreground/40" />
        <p className="font-medium">Aucune chasse à proximité</p>
        <p className="text-sm text-muted-foreground">
          Essayez d&apos;agrandir la zone de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto px-4 pb-4 pt-2 space-y-3 flex flex-col">
      {hunts.map((hunt) => (
        <Link key={hunt.id} href={`/hunts/${hunt.id}`}>
          <HuntCard hunt={hunt} />
        </Link>
      ))}
    </div>
  );
}
