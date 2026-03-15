import HuntForm from "@/components/partner/HuntForm";
import { Hunt } from "@/components/partner/types";

async function getHunt(id: string): Promise<Hunt | null> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hunts/${id}`,
        { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
}

export default async function EditHuntPage({
                                               params,
                                           }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const hunt = await getHunt(id);

    if (!hunt) {
        return (
            <div className="p-8 text-sm text-gray-500">
                Chasse introuvable.
            </div>
        );
    }

    return <HuntForm initialData={hunt} />;
}