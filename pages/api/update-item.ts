// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { item } = req.body;

  const results = await prisma.item.update({
    where: {
      id: item.id,
    },
    data: {
      ...item,
    },
  });

  res.status(200).send(results);
}
