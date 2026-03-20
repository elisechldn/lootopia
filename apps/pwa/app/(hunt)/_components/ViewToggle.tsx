import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Map } from "lucide-react";
import { HuntMap } from "./HuntMap";
import { HuntList } from "./HuntList";
import { useState } from "react";

export default function ViewToggle() {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <div>
      <ToggleGroup
        variant="outline"
        defaultValue={["list"]}
        className="w-max"
        aria-label="View toggle"
        onValueChange={(val) => {
          if (val) setView(val as unknown as "list" | "map");
        }}
      >
        <ToggleGroupItem value="list">
          <List></List>List
        </ToggleGroupItem>
        <ToggleGroupItem value="map">
          <Map></Map>Map
        </ToggleGroupItem>
      </ToggleGroup>
      {view === "list" ? <HuntList /> : <HuntMap />}
    </div>
  );
}
