import ARScene from '../../../components/ar/ARScene'
import { getHuntById } from "@/services/hunt.service";

export default async function ARPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getHuntById(+id);
  return <ARScene hunt={data}/>
}
