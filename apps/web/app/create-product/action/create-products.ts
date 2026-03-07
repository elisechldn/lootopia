'use server';

import { revalidateTag } from "next/cache";

export default async function createProduct(formData: FormData) {
  const body = JSON.stringify(Object.fromEntries(formData));
  console.log("BODY -> ", body);
  
  await fetch(`${process.env.API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': "application/json" },
    body: body
  })

  revalidateTag('products', 'max');
}