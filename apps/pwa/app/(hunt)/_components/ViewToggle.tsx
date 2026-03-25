import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function ViewToggle() {
    return (
      <div>
        <ToggleGroup
          // type="single"
          defaultValue={["list"]}
          className="w-max"
          aria-label="View toggle"
        >
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="map">Map</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
}