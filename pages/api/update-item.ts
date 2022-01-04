// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, needed } = req.body


  const prisma = new PrismaClient()

  const results = await prisma.item.update({
    where: {
      id
    },
    data: {
      needed
    }
  })

  res.status(200).send(results)

}
