import type { GetStaticProps } from 'next'
import Head from 'next/head'
import { Item } from '@prisma/client'
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Switch from '@radix-ui/react-switch';
import { useEffect, useMemo, useState } from 'react';
import { Dictionary } from 'lodash';
import { styled } from '@stitches/react';
import { getItems } from './api/items';
import Fuse from 'fuse.js'


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


type CategoryDicitonary = Dictionary<[Item, ...Item[]]>
type CategoryTuple = [string, [Item, ...Item[]]]
type CategoryData = {
  category: string;
  items: [Item, ...Item[]];
}


const sortCatTuples = (a: CategoryTuple, b: CategoryTuple) => {
  const aCat = a[0];
  const bCat = b[0]
  if (aCat < bCat) {
    return -1
  } else if (
    aCat > bCat ) {
      return 1
    } else {
      return 0
    }
}
const itemsByCategories = (items: CategoryDicitonary):CategoryData[] => {
  return Object.entries(items).sort(sortCatTuples).map(([category, items]) => ({category, items}))
}

const Home = ({ items }: PageProps) => {

  const updateStatus = async (id: number, needed: boolean) => {
    await fetch('/api/update-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body : JSON.stringify({id, needed})
    })
  }

  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<Fuse.FuseResult<CategoryData>[]>([])
  const data = itemsByCategories(items)
  const fuse = useMemo(() => new Fuse(data, {keys: ['category', 'items.name']}), [data])

  useEffect(() =>{
    const results = fuse.search(searchText)
    console.log(results)
    setSearchResults(results)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ searchText, setSearchResults])

  const useSearchResults = searchText.length > 0 && searchResults
  const source = useSearchResults ? searchResults.map(res => res.item) : data
  const categoryElems = source.map(({category, items}) => <Category key={category} category={category}><Collapsible.Content>


  
   {items.map(item => <>
   <label htmlFor={`${item.id}`}>{item.name}</label>
   <StyledSwitch id={`${item.id}`} defaultChecked={item.needed} onCheckedChange={(needed) => updateStatus(item.id, needed) } >
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

        <input type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)}></input>
        <code>{categoryElems}</code>


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
