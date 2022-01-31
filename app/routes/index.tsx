import { Category, Item, StoreType } from "@prisma/client";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "remix";
import { db } from "~/utils/db.server";
import groupBy from "lodash/groupBy";
import intersectionBy from "lodash/intersectionBy";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import CollapsableGroup from "../components/collabsible-group";
import { useRef, useState } from "react";
import { Switch, Thumb } from "../components/switch";
import { ButtonContainer, Tag } from "../components/tag";

type ItemData = {
  items: ItemWithStores[];
  stores: StoreType[];
  categories: Category[];
};
export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let stores = url.searchParams.getAll("stores").map((st) => Number(st));
  const storesQuery = {
    stores: {
      some: {
        id: {
          in: stores,
        },
      },
    },
  };
  const query = {
    where: {},
    include: {
      stores: true,
      category: true,
    },
  };

  if (stores?.length > 0) {
    query.where = storesQuery;
  }
  const loaderData: ItemData = {
    items: await db.item.findMany(query),
    stores: await db.storeType.findMany(),
    categories: await db.category.findMany(),
  };

  return loaderData;
};

export const action: ActionFunction = async ({ request }) => {
  console.log(request.method);
  let data;
  try {
    data = await request.formData();
  } catch (e) {
    console.log(e);
    return e;
  }
  switch (request.method) {
    case "POST":
      try {
        const name = data.get("name");
        const category = data.get("category");
        if (typeof name !== "string" || typeof category !== "string") {
          throw "Aww shucks";
        }
        if (typeof name === "string" && name.length > 0) {
          const resp = await db.item.create({
            data: {
              name,
              categoryId: Number(category),
            },
          });
          return resp;
        }
        return null;
      } catch (e) {
        console.log(e);

        return null;
      }

    case "PUT":
      try {
        const id = data.get("id");
        const needed = data.get("needed");
        const stores = data.getAll("stores") as string[];

        console.log(stores);

        const resp = await db.item.update({
          where: {
            id: Number(id),
          },
          data: {
            stores: {
              set: stores.map((str) => ({ id: Number(str) })),
            },
            needed: Boolean(needed === "on"),
          },
        });
        return resp;
      } catch (e) {
        console.log(e);
        return null;
      }
    case "DELETE": {
      const id = data.get("id");
      try {
        const resp = await db.item.delete({
          where: {
            id: Number(id),
          },
        });
        return true;
      } catch (e) {
        return e;
      }
    }
  }
};

export default function Index() {
  const { items, stores, categories } = useLoaderData<ItemData>();
  let [searchParams, setSearchParams] = useSearchParams();
  let storesParams = searchParams.getAll("stores").map((str) => Number(str));
  const sortedSource = sortItems(items);

  const submit = useSubmit();
  function handleChange(event: any) {
    submit(event.currentTarget, { replace: true, method: "put" });
  }

  const filterFormRef = useRef<HTMLFormElement>(null);
  return (
    <div>
      <h1>Patmore</h1>
      <Form replace method="post" action="/?index">
        <label>
          Name
          <input type="text" name="name" />
        </label>
        <select name="category">
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button>Submit</button>
      </Form>
      <hr />
      <div>
        <label>Filter By Store</label>
        <Form
          method="get"
          ref={filterFormRef}
          onChange={(e) => submit(e.currentTarget)}
        >
          {stores.map((store) => (
            <Tag
              key={store.name}
              name="stores"
              value={store.id}
              defaultChecked={storesParams.includes(store.id)}
            >
              {store.name}
            </Tag>
          ))}
        </Form>
      </div>

      {sortedSource.map(({ category, items }) => (
        <CollapsableGroup key={category} label={category}>
          <CollapsibleContent>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex" }}>
                <Form
                  replace
                  method="put"
                  action="/?index"
                  onChange={handleChange}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <ItemContainer
                    item={item}
                    stores={stores}
                    onCheckedChange={async (
                      item: ItemWithStores,
                      needed?: boolean
                    ) => {}}
                    onUpdateStore={async (
                      item: ItemWithStores,
                      store: StoreType
                    ) => {}}
                  />
                </Form>
                <Form replace method="delete" action="/?index">
                  <input type="hidden" name="id" value={item.id} />
                  <button>X</button>
                </Form>
              </div>
            ))}
          </CollapsibleContent>
        </CollapsableGroup>
      ))}
    </div>
  );
}
const groupItemsByCategory = (items: ItemWithStores[]) =>
  groupBy(items, "category.name");
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

type ItemWithStores = Item & { stores: StoreType[]; category: Category };
const ItemContainer = ({
  item,
  stores,
  onCheckedChange,
  onUpdateStore,
}: {
  item: ItemWithStores;
  stores: StoreType[];
  onCheckedChange: (
    item: ItemWithStores,
    needed?: boolean | undefined
  ) => Promise<void>;
  onUpdateStore: (item: ItemWithStores, store: StoreType) => void;
}) => {
  return (
    <div style={{ display: "flex" }}>
      <Switch
        id={`${item.id}`}
        name={"needed"}
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
              key={store.id}
              defaultChecked={
                item.stores.filter((s) => s.id === store.id).length > 0
              }
              name={`stores`}
              value={store.id}
            >
              {store.name}
            </Tag>
            // <Tag
            //   key={store.name}
            // selected={item.stores.filter((s) => s.id === store.id).length > 0}
            //   onClick={() => onUpdateStore(item, store)}
            // >
            //   {store.name}
            // </Tag>
          ))}
        </ButtonContainer>
      </div>
    </div>
  );
};
