"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { List, Map } from "lucide-react";

type Props = {
  value: "list" | "map";
  onChange: (value: "list" | "map") => void;
  className?: string;
};

export default function ViewToggle({ value, onChange, className }: Props) {
  return (
    <div className={className}>
      <ToggleGroup
        value={[value]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === "list" || next === "map") onChange(next);
        }}
        aria-label="Basculer la vue"
      >
        <ToggleGroupItem
          value="list"
          className="flex-1 border-none data-[state=on]:bg-white dark:data-[state=on]:bg-white/20 data-[state=on]:shadow-md"
        >
          <List /> Liste
        </ToggleGroupItem>
        <ToggleGroupItem
          value="map"
          className="flex-1 border-none data-[state=on]:bg-white dark:data-[state=on]:bg-white/20 data-[state=on]:shadow-md"
        >
          <Map /> Carte
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
