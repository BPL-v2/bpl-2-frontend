import {
  Condition,
  GameVersion,
  ItemField,
  ItemWish,
  MinimalUser,
  Objective,
  Operator,
} from "@client/api";
import {
  useDeleteItemWish,
  useFile,
  useGetEventStatus,
  useGetRules,
  useGetUser,
  useGetUsers,
  useGetWishlist,
  useCreateItemWish,
  useUpdateItemWish,
} from "@client/query";
import { Dialog } from "@components/dialog";
import { useAppForm } from "@components/form/context";
import { ObjectiveIcon } from "@components/objective-icon";
import Table from "@components/table/table";
import {
  ExclamationCircleIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { decodePoBExport, Rarity } from "@utils/pob";
import { flatMap } from "@utils/utils";
import { useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/team/wishlist")({
  component: RouteComponent,
});

type UniqueInfo = {
  condition: Condition;
  tier: number | null;
  is_drop_restricted: boolean | null;
  is_point_unique: boolean;
};

type WishRow = {
  user: MinimalUser;
  wish: ItemWish;
  uniqueInfo: UniqueInfo;
};

function RouteComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemFilter, setItemfilter] = useState<string>("");
  const { currentEvent } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { rules } = useGetRules(currentEvent.id);
  const { data: uniques } = useFile<
    Record<string, { base_type: string; is_drop_restricted: boolean }>
  >("assets/poe1/items/uniques.json");
  const { data: uniqueTiers = {} } = useFile<Record<string, number>>(
    "assets/poe1/items/unique_tiers.json",
  );
  const altGems =
    rules?.children
      .filter((obj) => (obj.name = "Gems"))
      .flatMap((obj) => obj.children)
      .filter((obj) => (obj.name = "Transfigured Gems"))
      .flatMap((obj) => obj.children)
      .map((obj) => obj.conditions[0].value) || [];
  const pointUniques = flatMap(rules)
    .map((obj) => {
      for (const condition of obj.conditions) {
        if (
          condition.field === ItemField.NAME &&
          condition.operator === Operator.EQ
        ) {
          return condition.value;
        }
      }
      return null;
    })
    .filter((i) => i !== null);
  const { users = [] } = useGetUsers(currentEvent.id);
  const { user } = useGetUser();

  const { wishlist = [] } = useGetWishlist(
    currentEvent.id,
    eventStatus?.team_id,
  );
  const qc = useQueryClient();
  const { saveItemWish } = useCreateItemWish(
    qc,
    currentEvent.id,
    eventStatus?.team_id,
  );
  const { updateItemWish } = useUpdateItemWish(
    qc,
    currentEvent.id,
    eventStatus?.team_id,
  );
  const { deleteItemWish } = useDeleteItemWish(
    qc,
    currentEvent.id,
    eventStatus?.team_id,
  );

  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<number, (typeof users)[number]>,
  );
  const rowMap = {} as Record<number, any[]>;
  const wishCounter = {} as Record<string, number>;
  for (const wish of wishlist) {
    if (!wishCounter[wish.value]) {
      wishCounter[wish.value] = 0;
    }
    if (!wish.fulfilled) {
      wishCounter[wish.value] += 1;
    }
    if (!rowMap[wish.user_id]) {
      rowMap[wish.user_id] = [];
    }
    const itemInfo = {
      condition: {
        field: wish.item_field,
        operator: Operator.EQ,
        value: wish.value,
      },
      tier: uniqueTiers[wish.value],
      is_drop_restricted: uniques
        ? uniques[wish.value]?.is_drop_restricted
        : null,
      is_point_unique: pointUniques.includes(wish.value),
    };
    rowMap[wish.user_id].push({ wish: wish, uniqueInfo: itemInfo });
  }
  const rows: WishRow[] = [];
  for (const [userId, wishes] of Object.entries(rowMap)) {
    const user = userMap[Number(userId)];
    for (const wish of wishes) {
      rows.push({ user, wish: wish.wish, uniqueInfo: wish.uniqueInfo });
    }
  }
  const columns: ColumnDef<WishRow>[] = [
    {
      header: "",
      accessorKey: "user.display_name",
      size: 250,
      filterFn: "includesString",
      enableSorting: false,
      meta: {
        filterVariant: "string",
        filterPlaceholder: "User",
      },
    },
    {
      header: "",
      accessorKey: "uniqueInfo.condition.value",
      size: 350,
      filterFn: "includesString",
      cell: (info) => {
        return (
          <div className="flex items-center gap-1">
            <ObjectiveIcon
              className="h-8"
              objective={
                {
                  conditions: [info.row.original.uniqueInfo.condition],
                } as Objective
              }
              gameVersion={GameVersion.poe1}
            ></ObjectiveIcon>
            {info.row.original.uniqueInfo.condition.value}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        filterVariant: "string",
        filterPlaceholder: "Wish",
      },
    },
    {
      header: "Tier",
      accessorKey: "uniqueInfo.tier",
      size: 80,
      cell: (info) => {
        const tier = info.row.original.uniqueInfo.tier;
        if (tier === null || tier === undefined) {
          return;
        }
        return (
          <span
            className={twMerge(
              "font-bold text-success",
              tier < 4 ? "text-warning" : "",
              tier < 2 ? "text-error" : "",
            )}
          >
            {tier}
          </span>
        );
      },
    },
    {
      header: "Count",
      id: "count",
      size: 70,
      cell: (info) => {
        const wishValue = info.row.original.uniqueInfo.condition.value;
        const count = wishCounter[wishValue] || 0;
        if (count < 2) {
          return;
        }
        return <span className="font-bold text-error">{count}</span>;
      },
    },
    {
      header: "Point Item",
      accessorKey: "uniqueInfo.is_point_unique",
      size: 100,
      cell: (info) => {
        return info.row.original.uniqueInfo.is_point_unique ? (
          <ExclamationCircleIcon className="size-5 text-error"></ExclamationCircleIcon>
        ) : null;
      },
      enableSorting: false,
    },
    {
      header: "Build Enabling",
      accessorKey: "wish.build_enabling",
      size: 150,
      cell: (info) => {
        return (
          <input
            type="checkbox"
            defaultChecked={info.row.original.wish.build_enabling}
            disabled={user?.id != info.row.original.user?.id}
            className={twMerge(
              "checkbox border-2",
              info.row.original.wish.build_enabling ? "checkbox-success" : "",
            )}
            onChange={async (e) => {
              updateItemWish({
                wishId: info.row.original.wish.id,
                item_wish: {
                  build_enabling: e.target.checked,
                },
              });
            }}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Priority",
      accessorKey: "wish.priority",
      size: 100,
      cell: (info) => {
        return (
          <div className="flex items-center gap-1">
            <span>{info.row.original.wish.priority}</span>
            {eventStatus?.is_team_lead && (
              <div className="flex flex-col gap-0.5">
                <PlusIcon
                  onClick={() => {
                    updateItemWish({
                      wishId: info.row.original.wish.id,
                      item_wish: {
                        priority: info.row.original.wish.priority + 1,
                      },
                    });
                  }}
                  className="size-3 cursor-pointer border text-success"
                ></PlusIcon>
                <MinusIcon
                  onClick={() => {
                    updateItemWish({
                      wishId: info.row.original.wish.id,
                      item_wish: {
                        priority: info.row.original.wish.priority - 1,
                      },
                    });
                  }}
                  className="size-3 cursor-pointer border text-error"
                ></MinusIcon>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Fulfilled",
      accessorKey: "wish.fulfilled",
      size: 150,
      cell: (info) => {
        return (
          <input
            type="checkbox"
            defaultChecked={info.row.original.wish.fulfilled}
            disabled={user?.id != info.row.original.user?.id}
            className={twMerge(
              "checkbox border-2",
              info.row.original.wish.fulfilled ? "checkbox-success" : "",
            )}
            onChange={async (e) => {
              updateItemWish({
                wishId: info.row.original.wish.id,
                item_wish: {
                  fulfilled: e.target.checked,
                },
              });
            }}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "",
      id: "delete",
      cell: (info) => {
        return (
          user?.id == info.row.original.user?.id && (
            <button onClick={() => deleteItemWish(info.row.original.wish.id)}>
              <TrashIcon className="size-5 cursor-pointer text-error"></TrashIcon>
            </button>
          )
        );
      },
    },
  ];
  const form = useAppForm({
    defaultValues: {
      unique_name: "",
      gem_name: "",
      pob_export: "",
    },
    onSubmit: (data) => {
      if (data.value.pob_export) {
        const pobData = decodePoBExport(data.value.pob_export);
        pobData.items
          .filter((item) => item.rarity === Rarity.Unique)
          .map((item) => item.name)
          .forEach((itemName) =>
            saveItemWish({
              item_field: ItemField.NAME,
              value: itemName,
            }),
          );
        pobData.skills.skillSets
          .flatMap((set) => set.skills)
          .flatMap((skill) => skill.gems)
          .filter((gem) => gem.variantId.includes("Alt"))
          .map((gem) => gem.nameSpec)
          .forEach((itemName) =>
            saveItemWish({
              item_field: ItemField.BASE_TYPE,
              value: itemName,
            }),
          );
      }
      if (data.value.unique_name) {
        saveItemWish({
          item_field: ItemField.NAME,
          value: data.value.unique_name,
        });
      }
      if (data.value.gem_name) {
        saveItemWish({
          item_field: ItemField.BASE_TYPE,
          value: data.value.gem_name,
        });
      }
      form.reset();
      setDialogOpen(false);
    },
  });
  return (
    <div className="p-4">
      <div className="flex flex-row gap-4">
        <input
          type="search"
          className="input"
          placeholder="Paste item to see if anyone wants it..."
          value={itemFilter}
          onPaste={(e) => {
            const paste = e.clipboardData.getData("text");
            if (paste.split("\n").length > 2) {
              setItemfilter(paste.split("\n")[2].trim());
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            setItemfilter(e.target.value);
          }}
        />

        <button
          className="btn mb-4"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Add Item Wish
        </button>
      </div>
      <Dialog
        title="Add Item Wish"
        open={dialogOpen}
        setOpen={() => setDialogOpen(false)}
      >
        <div className="flex w-full flex-col gap-4">
          <form
            className="fieldset w-full rounded-box bg-base-300 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.AppField
              name="unique_name"
              children={(field) => (
                <field.TextField
                  label="Unique"
                  options={uniques ? Object.keys(uniques) : []}
                />
              )}
            />
            <form.AppField
              name="gem_name"
              children={(field) => (
                <field.TextField label="Gem" options={altGems} />
              )}
            />
            <form.AppField
              name="pob_export"
              children={(field) => <field.TextField label="PoB Export" />}
            />
          </form>
          <div className="flex w-full justify-end gap-2">
            <button
              className="btn bg-base-300"
              onClick={() => {
                setDialogOpen(false);
                form.reset();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => form.handleSubmit()}
            >
              Save
            </button>
          </div>
        </div>
      </Dialog>
      <Table
        columns={columns}
        data={rows
          .filter((row) => {
            if (!itemFilter) {
              return true;
            }
            return (
              row.wish.value.toLowerCase().includes(itemFilter.toLowerCase()) &&
              !row.wish.fulfilled
            );
          })
          .sort((a, b) => {
            if (a.user?.id != b.user?.id) {
              return a.user?.id - b.user?.id;
            }
            return a.wish.priority - b.wish.priority;
          })}
      />
    </div>
  );
}
