import type { GetStaticProps } from "next";
import Head from "next/head";
import { Category, Item, StoreType } from "@prisma/client";
import { Content as CollapsibleContent } from "@radix-ui/react-collapsible";
import { useEffect, useMemo, useState } from "react";
import { styled } from "@stitches/react";
import groupBy from "lodash/groupBy";
import intersectionBy  from "lodash/intersectionBy";

import Fuse from "fuse.js";
import useSWR from "swr";
import { getItems } from "./api/items";
import { Switch, Thumb } from "../components/switch";
import { CollapsableGroup } from "../components/collapsable-group";
import { Tag } from "../components/tag";
import { getStores } from "./api/stores";

const groupItemsByCategory = (items: ItemWithStores[]) => groupBy(items, "category.name");

type ItemWithStores = Item & { stores : StoreType[], category : Category}
type PageProps = {
  items: ItemWithStores[]
  stores: StoreType[]
};

type CategoryTuple = [string, [ItemWithStores, ...ItemWithStores[]]];
type CategoryData = {
  category: string;
  items: [ItemWithStores, ...ItemWithStores[]];
};

const sortCatTuples = (a: CategoryTuple, b: CategoryTuple) => {
  const aCat = a[0];
  const bCat = b[0];
  if (aCat < bCat) {
    return -1;
  } else if (aCat > bCat) {
    return 1;
  } else {
    return 0;
  }
};
const sortItems = (items: ItemWithStores[]): CategoryData[] => {
  const itemsByCategory = groupItemsByCategory(items);
  
  return Object.entries(itemsByCategory)
    .sort(sortCatTuples)
    .map(([category, items]) => {
      items.sort((itemA, itemB) => {
        if (itemA.name < itemB.name) {
          return -1;
        } else if (itemA.name > itemB.name) {
          return 1;
        } else {
          return 0;
        }
      });
      return { category, items };
    });
};


const ButtonContainer = styled("div", {
  display: "flex",
  [`& ${Tag}`]: {
    marginRight: "4px",
  },
});

const ItemContainer = ({
  item,
  stores,
  onCheckedChange,
  onUpdateStore,
}: {
  item: ItemWithStores;
  stores: StoreType[];
  onCheckedChange: (item: ItemWithStores, needed?: boolean | undefined) => Promise<void>;
  onUpdateStore: (item: ItemWithStores, store: StoreType) => void;
}) => {
  return (
    <div style={{ display: "flex" }}>
      <Switch
        id={`${item.id}`}
        defaultChecked={item.needed}
        onCheckedChange={(needed) => onCheckedChange(item, needed)}
      >
        <Thumb />
      </Switch>
      <div>
        <label htmlFor={`${item.id}`}>{item.name}</label>
        <ButtonContainer>
          {stores.map((store) => (
            <Tag
              key={store.name}
              selected={item.stores.filter(s => s.id === store.id).length > 0}
              onClick={() => onUpdateStore(item, store)}
            >
              {store.name}
            </Tag>
          ))}
        </ButtonContainer>
      </div>
    </div>
  );
};

const fetcher = async (
  input: RequestInfo,
  init: RequestInit,
  ...args: any[]
) => {
  const res = await fetch(input, init);
  return res.json();
};

const Home = ({ items, stores}: PageProps) => {
  const {
    data: fetchedData,
    error,
    mutate,
  } = useSWR<ItemWithStores[]>("/api/items", fetcher, { fallbackData: items });

  const mutateItems = (item: ItemWithStores) => {
    if (!fetchedData) {
      return;
    }
    const newData = [...fetchedData.filter((i) => i.id !== item.id), item];
    mutate(newData, { revalidate: false });
  };

  const updateItem = async (item: ItemWithStores, needed?: boolean) => {
    mutateItems(item);

    const {category, stores, ...newItem } = item
    await fetch("/api/update-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: { ...newItem, needed } }),
    }).then(() => mutate());
  };

  const updateItemStores = async (item: ItemWithStores, store: StoreType) => {
    let newStores;
    if (item.stores.filter(s => s.id === store.id).length > 0) {
      newStores = item.stores.filter((x) => x.id !== store.id);
    } else {
      newStores = [...item.stores, store];
    }


    const newItem = { ...item, stores: newStores };
    mutateItems(newItem)
    await fetch("/api/update-item-stores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: newItem }),
    }).then(() => mutate());
   
  };

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<ItemWithStores[]>([]);
  const [storeFilters, setStoreFilters] = useState<StoreType[]>([]);

  const toggleStoreFilter = (store: StoreType) => {
    if (storeFilters.some(s => s.id === store.id )) {
      const newVal = storeFilters.filter((s) => s.id !== store.id);
      setStoreFilters(newVal);
    } else {
      setStoreFilters([...storeFilters, store]);
    }
  };

  const data = useMemo(() => fetchedData ?? [], [fetchedData]);

  const fuse = useMemo(
    () => new Fuse(data, { keys: ["category.name", "name", "stores.name"] }),
    [data]
  );

  useEffect(() => {
    const results = fuse.search(searchText).map((res) => res.item);
    setSearchResults(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, setSearchResults]);

  const useSearchResults = searchText.length > 0 && searchResults;
  const source = useSearchResults ? searchResults : data;
  const filteredSource =
    storeFilters.length > 0
      ? source.filter((item) => {
          const matchesFilters =
            intersectionBy (item.stores, storeFilters, 'id').length > 0;
          return matchesFilters;
        })
      : source;
  const sortedSource = sortItems(filteredSource);

  const categoryElems = sortedSource.map(({ category, items }) => (
    <CollapsableGroup key={category} label={category}>
      <CollapsibleContent>
        {items.map((item) => (
          <ItemContainer
            key={item.id}
            item={item}
            stores={stores}
            onCheckedChange={updateItem}
            onUpdateStore={updateItemStores}
          />
        ))}
      </CollapsibleContent>
    </CollapsableGroup>
  ));
  return (
    <div>
      <Head>
        <title>Patmore App</title>
        <meta name="description" content="Patmore" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>
          <label>
            Search
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            ></input>
          </label>
          <div>
            <label>Filter By Store</label>
            {stores.map((store) => (
              <Tag
                key={store.name}
                selected={storeFilters.some(s => s.id === store.id)}
                onClick={() => toggleStoreFilter(store)}
              >
                {store.name}
              </Tag>
            ))}

            {storeFilters.length > 0 && (
              <button onClick={() => setStoreFilters([])}>clear</button>
            )}
          </div>
        </div>
        <hr />
        <div>{categoryElems}</div>
      </main>

      <footer></footer>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const items = await getItems();
  const stores = await getStores();
  return {
    props: {
      items,
      stores
    },
  };
};

export default Home;
