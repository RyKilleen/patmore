// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, needed } = req.body


  const prisma = new PrismaClient()

  await prisma.item.update({
    where: {
      id
    },
    data: {
      needed
    }
  })

}
