// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Item, PrismaClient } from '@prisma/client'

import type { NextApiRequest, NextApiResponse } from 'next'


export const getItems = async () => {
    const prisma = new PrismaClient()
    const items = await prisma.item.findMany()
  
    // const categoriedItems = groupBy(items, 'category')
    return items
}




export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
const prisma = new PrismaClient()
  const items = await getItems();
  
  res.status(200).json(items)

}
