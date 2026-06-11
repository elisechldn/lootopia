import { Suspense } from "react";
import ARPageContent from "@/components/ar/ARPageContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ARPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <ARPageContent huntId={+id} />
    </Suspense>
  );
}
