import type { GetStaticProps } from 'next'
import Head from 'next/head'
import { Item, Prisma, PrismaClient } from '@prisma/client'
import groupBy from 'lodash/groupBy'
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Switch from '@radix-ui/react-switch';
import { useState } from 'react';
import { Dictionary } from 'lodash';
import { styled } from '@stitches/react';
import { getItems } from './api/items';


type PageProps = {
  items: Dictionary<[Item, ...Item[]]>
}

const Category = ({ category, children }: { category: string, children?: any }) => {
  const [open, setOpen] = useState(true)

  return <Collapsible.Root open={open} onOpenChange={setOpen}>

            <h2>{category}  <Collapsible.Trigger>{open ? '-' : '+'}</Collapsible.Trigger></h2>
            {children}
  </Collapsible.Root>
}

const StyledSwitch = styled(Switch.Root, {
  $$checkedColor : 'black',
  $$backgroundColor: 'grey',

  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: '$$backgroundColor',
  borderRadius: '9999px',
  position: 'relative',
  boxShadow: `0 2px 10px grey`,
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': { boxShadow: `0 0 0 2px black` },
  '&[data-state="checked"]': { backgroundColor: '$$checkedColor' },
});

const StyledThumb = styled(Switch.Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: 'white',
  borderRadius: '9999px',
  boxShadow: `0 2px 2px grey`,
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
});



const Home = ({ items }: PageProps) => {

  // const {data, error} = useSWR()
    
  const categories = Object.entries(items).map(([category, items]) => <Category category={category}><Collapsible.Content>
    {JSON.stringify(items)}
    <hr />
    
     {items.map(item => <>
     <label htmlFor={`${item.id}`}>{item.name}</label>
     <StyledSwitch id={`${item.id}`} defaultChecked={item.needed} >
        <StyledThumb />
     </StyledSwitch>
     </>)}
  </Collapsible.Content></Category>)
  return (
    <div>
      <Head>
        <title>Patmore App</title>
        <meta name="description" content="Patmore" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>

        <code>{categories}</code>


      </main>

      <footer>

      </footer>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {

  const items = await getItems()
  return {
    props: {
      items
    }
  }
}

export default Home
