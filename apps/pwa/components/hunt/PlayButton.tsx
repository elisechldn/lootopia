'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type PlayButtonProps = {
  huntId: string;
};

export default function PlayButton({ huntId }: PlayButtonProps) {
  const router = useRouter();

  const handlePlay = async () => {
    // iOS 13+ exige que DeviceOrientationEvent.requestPermission soit appelé
    // depuis un geste utilisateur. On le fait ici, avant d'entrer dans la vue AR,
    // pour éviter d'interrompre l'expérience une fois la scène lancée.
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      await (DeviceOrientationEvent as any).requestPermission();
    }
    router.push(`/ar/${huntId}`);
  };

  return (
    <Button
      size="lg"
      className="w-full p-10 text-base font-bold uppercase tracking-widest"
      onClick={handlePlay}
    >
      Jouer
    </Button>
  );
}
