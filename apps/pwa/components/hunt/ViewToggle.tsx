'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';

type Props = {
  value: 'list' | 'map';
  onChange: (value: 'list' | 'map') => void;
};

export default function ViewToggle({ value, onChange }: Props) {
  return (
      <>
         <ToggleGroup
           value={[value]}
           onValueChange={(values) => {
             const next = values[0];
             if (next === 'list' || next === 'map') onChange(next);
           }}
           aria-label="Basculer la vue"
         >
          <ToggleGroupItem value="list">Liste</ToggleGroupItem>
          <ToggleGroupItem value="map">Carte</ToggleGroupItem>
        </ToggleGroup>
      </>
  );
}
