'use client'

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { List, Map } from "lucide-react";
import { HuntMap } from "./HuntMap";
import { HuntList } from "./HuntList";
import { useState } from "react";

export default function ViewToggle() {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <div className="w-full p-4 space-y-4">
      <ToggleGroup
        variant="outline"
        value={[view]}
        className="flex w-full rounded-lg p-1 bg-gray-200"
        aria-label="View toggle"
        onValueChange={(val: string[]) => {     {/* ← string[] */}
          const last = val[val.length - 1];
          if (last === "list" || last === "map") {
            setView(last);
          }
        }}
      >
        <ToggleGroupItem value="list" className="flex-1 border-none data-[state=on]:bg-white data-[state=on]:shadow-md">
          <List /> Liste
        </ToggleGroupItem>
        <ToggleGroupItem value="map" className="flex-1 border-none data-[state=on]:bg-white data-[state=on]:shadow-md">
          <Map /> Carte
        </ToggleGroupItem>
      </ToggleGroup>
      {view === "list" ? <HuntList /> : <HuntMap />}
    </div>
  );
}