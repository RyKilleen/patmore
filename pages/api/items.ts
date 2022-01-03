// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from '@prisma/client'
import { groupBy } from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'


export const getItems = async () => {
    const prisma = new PrismaClient()
    const items = await prisma.item.findMany()
  
    const categoriedItems = groupBy(items, 'category')
    return categoriedItems
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const items = await getItems();
  
  res.status(200).json(items)

}
