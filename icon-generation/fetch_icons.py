from io import BytesIO
import os
from typing import Optional, TypedDict
from urllib import request
import urllib.parse
import json
from build_images import generate_flask_image, generate_gem_image


def encode(string: str) -> str:
    return (
        string
        .replace(" ", "_")
        .replace("%", "")
        .replace(",", "")
    )


class VisualIdentity(TypedDict):
    dds_file: str


class Item(TypedDict):
    name: str
    visual_identity: dict


ItemDict = dict[str, Item]


class Gem(TypedDict):
    display_name: str
    discriminator: Optional[str]
    color: Optional[str]


def get_base_name(gem) -> Optional[str]:
    if "base_item" in gem:
        if gem["base_item"] is not None:
            return gem["base_item"]["display_name"]
    return None


def get_gem_dict() -> dict[str, list[Gem]]:
    response = request.urlopen("https://repoe-fork.github.io/gems.json")
    full_gems: dict = json.loads(response.read())
    gems: dict[str, list[Gem]] = {}
    gem_colors = {"r": set(), "g": set(), "b": set(), "w": set()}
    for gem in full_gems.values():
        base_name = get_base_name(gem)
        if base_name is not None:
            if base_name not in gems:
                gems[base_name] = []
            if "color" in gem and gem["color"] is not None:
                gem_colors[gem["color"]].add(gem["display_name"])
            gems[base_name].append({
                "display_name": gem["display_name"],
                "discriminator": gem.get("discriminator"),
                "color": gem.get("color")
            })
    with open(f"public/assets/poe1/items/gem_colors.json", "w") as file:
        json.dump({k: sorted(v)
                   for k, v in gem_colors.items()}, file, indent=4)
    return gems


def download():
    gems = get_gem_dict()
    for version in ["poe1", "poe2"]:
        if not os.path.exists(f"public/assets/{version}/items/uniques"):
            os.makedirs(f"public/assets/{version}/items/uniques")
        if not os.path.exists(f"public/assets/{version}/items/basetypes"):
            os.makedirs(f"public/assets/{version}/items/basetypes")
        if not os.path.exists(f"icon-generation/temp/{version}"):
            os.makedirs(f"icon-generation/temp/{version}")

        baseUrl = "https://repoe-fork.github.io/"
        if version == "poe2":
            baseUrl += "poe2/"
        response = request.urlopen(
            f"{baseUrl}/base_items.json")
        base_items: ItemDict = json.loads(response.read())

        response = request.urlopen(
            f"{baseUrl}/uniques.json")
        uniques: ItemDict = json.loads(response.read())

        for unique in uniques.values():
            save_image(
                unique, f"public/assets/{version}/items/uniques", baseUrl, {})
        for base in base_items.values():
            save_image(base, f"public/assets/{version}/items/basetypes",
                       baseUrl, gems if version == "poe1" else {})


anomalous_uniques = [
    "Sekhema's Resolve",
    "Grand Spectrum",

    "Impresence",
    "Combat Focus",
    "Precursor's Emblem",
    "Doryani's Delusion",
    "The Beachhead",
]


def save_gem_image(base_name, gems: list[Gem], path: str, url: str):
    game_version = "poe1" if "poe1" in path else "poe2"
    temp_path = os.path.join(
        f"icon-generation/temp/{game_version}", encode(base_name) + ".webp")

    if not os.path.isfile(temp_path):
        try:
            response = request.urlopen(url)
            with open(temp_path, "wb") as file:
                file.write(response.read())
        except Exception as e:
            print("could not download", url)
            print(e)
            return
    for gem in gems:
        try:
            img = generate_gem_image(
                temp_path, gem["color"], gem["discriminator"])
            img.save(os.path.join(path, encode(gem["display_name"]) + ".webp"))
        except Exception as e:
            print("could not save", e)


def save_flask_image(item: Item, path: str, baseUrl: str):
    name = item["name"]
    game_version = "poe1" if "poe1" in path else "poe2"
    rarity = "unique" if "unique" in path else "normal"
    temp_path = os.path.join(
        f"icon-generation/temp/{game_version}", encode(name) + ".webp")
    full_path = os.path.join(path, encode(name) + ".webp")
    if not os.path.isfile(temp_path):

        item_path = urllib.parse.quote(
            item["visual_identity"]["dds_file"].replace('.dds', '')) + ".webp"
        url = baseUrl + item_path
        try:
            response = request.urlopen(url)
            with open(temp_path, "wb") as file:
                file.write(response.read())
        except Exception as e:
            print("could not download", url)
            print(e)
            return
    generate_flask_image(temp_path, game_version, rarity).save(full_path)


def save_image(item: Item, path: str, baseUrl: str, gems: dict[str, list[Gem]]):
    name = item["name"]
    if name in anomalous_uniques:
        name = item["visual_identity"]["dds_file"].split(
            "/")[-1].replace(".dds", "")
    elif name in gems:
        return save_gem_image(name, gems[name], path, baseUrl +
                              urllib.parse.quote(item["visual_identity"]["dds_file"].replace('.dds', '')) + ".webp")
    if (item.get("domain") == "flask" and "Charm" not in name) or item.get("item_class") == "Flask":
        return save_flask_image(item, path, baseUrl)

    full_path = os.path.join(path, encode(name) + ".webp")
    if os.path.isfile(full_path):
        return
    item_path = urllib.parse.quote(
        item["visual_identity"]["dds_file"].replace('.dds', '')) + ".webp"
    url = baseUrl + item_path
    try:
        response = request.urlopen(url)
        with open(full_path, "wb") as file:
            file.write(response.read())
    except Exception as e:
        print("could not download", url)


if __name__ == "__main__":
    download()
