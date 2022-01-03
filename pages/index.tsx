import type { GetStaticProps } from 'next'
import Head from 'next/head'
import { Item, Prisma, PrismaClient } from '@prisma/client'


type PageProps =  {
  items : Item[]
}

const Home = ({items} : PageProps) => {
  return (
    <div>
      <Head>
        <title>Patmore App</title>
        <meta name="description" content="Patmore" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
       

        <code>{JSON.stringify(items)}</code>

      </main>

      <footer>
      
      </footer>
    </div>
  )
}

export const getStaticProps : GetStaticProps =  async (context) => {

  const prisma = new PrismaClient()
  const items = await prisma.item.findMany()
  return {
    props: {
      items
    }
  }
}

export default Home
