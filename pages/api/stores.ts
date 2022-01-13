// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../prisma/client";

export const getStores = async () => {
  const stores = await prisma.storeType.findMany()
  return stores;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stores = await getStores();
  res.status(200).json(stores);
}
