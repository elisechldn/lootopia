import {
  type HuntGetPayload,
  HuntModel,
  PaginatedResult,
  SingleResult,
  StepModel,
} from "@repo/types";

type HuntWithSteps = HuntGetPayload<{
    include: { steps: true };
}>;

export async function getAllHunts() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunts`);
    if (!response.ok) throw new Error('No Hunt found');
    return response.json() as Promise<PaginatedResult<HuntModel>>;
}

export async function getHuntById(id: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunts/${id}`);
    if (!response.ok) throw new Error('No Hunt found');
    return response.json() as Promise<SingleResult<HuntWithSteps>>;
}