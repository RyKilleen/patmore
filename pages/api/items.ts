import { Item, Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../prisma/client";

export const getItems = async () => {
  const items = await prisma.item.findMany({
    include: {
      stores: true,
      category: true
    }
  });
  return items;
};
 
interface CreateItemRequest extends NextApiRequest {
  body: {
    item : Prisma.ItemCreateInput
  };
  method : 'POST'
}

export default async function handler(
  req: CreateItemRequest | NextApiRequest,
  res: NextApiResponse
) {

  switch (req.method) {
    case 'POST':
      const { item } = req.body 
      const response = prisma.item.create(
        {
          data : item
        }
      )
      res.status(200).json(response);
    case 'GET':
    default:
      const items = await getItems();
      res.status(200).json(items);
  }
}
