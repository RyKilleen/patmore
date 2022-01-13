// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Item, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { item } = req.body;

  try {
    const results = await prisma.item.create({ data: item });
    res.status(200).send(results);
  } catch (e) {
    res.status(500).send(e);
  }
}
