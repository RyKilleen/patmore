// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Item, Prisma, StoreType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../prisma/client";

export const getStores = async () => {
  const stores = await prisma.storeType.findMany()
  return stores;
};

interface UpdateStoresRequest extends NextApiRequest {
  body: {
    item: Prisma.ItemUncheckedUpdateInput
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { item } = req.body
  const { id, stores } = item;

  const updatedItem = await prisma.item.update({
    where: {
      id: id
    },
    data: {
      stores: {
        set: stores.map((s : StoreType) => ({id : s.id}))
      },
    }
  })
  res.status(200).json(updatedItem);
}


