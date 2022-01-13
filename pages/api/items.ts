// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Item, PrismaClient } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
export const getItems = async () => {
  const items = await prisma.item.findMany();
  return items;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const items = await getItems();
  res.status(200).json(items);
}
