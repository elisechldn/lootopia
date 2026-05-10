import ARScene from '@/components/ar/ARScene';
import { getHuntById } from '@/services/hunt.service';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ participationId?: string; stepId?: string }>;
};

export default async function ARPage({ params, searchParams }: Props) {
  const [{ id }, { participationId, stepId }] = await Promise.all([params, searchParams]);
  const hunt = getHuntById(+id);

  return (
    <ARScene
      hunt={hunt}
      huntId={+id}
      participationId={participationId ? +participationId : undefined}
      stepId={stepId ? +stepId : undefined}
    />
  );
}
