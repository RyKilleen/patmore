import type { GetStaticProps } from "next";
import Head from "next/head";
import { Item, StoreType } from "@prisma/client";
import { Content as CollapsibleContent } from "@radix-ui/react-collapsible";
import { useEffect, useMemo, useState } from "react";
import { styled } from "@stitches/react";
import groupBy from "lodash/groupBy";
import intersection from "lodash/intersection";

import Fuse from "fuse.js";
import useSWR from "swr";
import { getItems } from "./api/items";
import { Switch, Thumb } from "../components/switch";
import { CollapsableGroup } from "../components/collapsable-group";
import { Tag } from "../components/tag";

const groupItemsByCategory = (items: Item[]) => groupBy(items, "category");
type PageProps = {
  items: Item[];
};

type CategoryTuple = [string, [Item, ...Item[]]];
type CategoryData = {
  category: string;
  items: [Item, ...Item[]];
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
const sortItems = (items: Item[]): CategoryData[] => {
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

const STORES = Object.keys(StoreType) as StoreType[];

const ButtonContainer = styled("div", {
  display: "flex",
  [`& ${Tag}`]: {
    marginRight: "4px",
  },
});

const ItemContainer = ({
  item,
  onCheckedChange,
  onUpdateStore,
}: {
  item: Item;
  onCheckedChange: (item: Item, needed?: boolean | undefined) => Promise<void>;
  onUpdateStore: (item: Item, store: StoreType) => void;
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
          {STORES.map((store) => (
            <Tag
              key={store}
              selected={item.stores.includes(store)}
              onClick={() => onUpdateStore(item, store)}
            >
              {store}
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

const Home = ({ items }: PageProps) => {
  const {
    data: fetchedData,
    error,
    mutate,
  } = useSWR<Item[]>("/api/items", fetcher, { fallbackData: items });

  const mutateItems = (item: Item) => {
    if (!fetchedData) {
      return;
    }
    const newData = [...fetchedData.filter((i) => i.id !== item.id), item];
    mutate(newData, { revalidate: false });
  };
  const updateItem = async (item: Item, needed?: boolean) => {
    mutateItems(item);

    await fetch("/api/update-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: { ...item, needed } }),
    }).then(() => mutate());
  };

  const updateItemStores = (item: Item, store: StoreType) => {
    let newStores;
    if (item.stores.includes(store)) {
      newStores = item.stores.filter((x) => x !== store);
    } else {
      newStores = [...item.stores, store];
    }

    const newItem = { ...item, stores: newStores };
    updateItem(newItem);
  };

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [storeFilters, setStoreFilters] = useState<StoreType[]>([]);

  const toggleStoreFilter = (store: StoreType) => {
    if (storeFilters.includes(store)) {
      const newVal = storeFilters.filter((s) => s !== store);
      setStoreFilters(newVal);
    } else {
      setStoreFilters([...storeFilters, store]);
    }
  };
  const data = useMemo(() => fetchedData ?? [], [fetchedData]);

  const fuse = useMemo(
    () => new Fuse(data, { keys: ["category", "name", "stores"] }),
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
            intersection(item.stores, storeFilters).length > 0;
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
            {STORES.map((store) => (
              <Tag
                key={store}
                selected={storeFilters.includes(store)}
                onClick={() => toggleStoreFilter(store)}
              >
                {store}
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
  return {
    props: {
      items,
    },
  };
};

export default Home;
