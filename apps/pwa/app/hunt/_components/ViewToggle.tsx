'use client'

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
        defaultValue={["list"]}
        className="flex w-full rounded-lg p-1 bg-gray-200"
        aria-label="View toggle"
        onValueChange={(val) => {
          if (val) setView(val as unknown as "list" | "map");
        }}
      >
        <ToggleGroupItem value="list" className="flex-1 border-none data-[state=on]:bg-white data-[state=on]:shadow-md">
          <List /> List
        </ToggleGroupItem>
        <ToggleGroupItem value="map" className="flex-1 border-none data-[state=on]:bg-white data-[state=on]:shadow-md">
          <Map /> Map
        </ToggleGroupItem>
      </ToggleGroup>
      {view === "list" ? <HuntList /> : <HuntMap />}
    </div>
  );
}
