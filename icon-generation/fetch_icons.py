from io import BytesIO
import os
from typing import TypedDict
from urllib import request
import urllib.parse
import json


def encode(string: str) -> str:
    return urllib.parse.quote(
        string
        .replace(" ", "_")
        .replace("ä", "a")
        .replace("ö", "o")
        .replace("ü", "u")
        .replace(":", "")
        .replace("%", "")
        .replace(",", ""), safe='\'')


class VisualIdentity(TypedDict):
    dds_file: str


class Item(TypedDict):
    name: str
    visual_identity: dict


ItemDict = dict[str, Item]


def prepare():
    response = request.urlopen(
        "https://raw.githubusercontent.com/repoe-fork/repoe-fork.github.io/refs/heads/master/RePoE/data/poe2/base_items.json")
    base_items: ItemDict = json.loads(response.read())

    response = request.urlopen(
        "https://raw.githubusercontent.com/repoe-fork/repoe-fork.github.io/refs/heads/master/RePoE/data/poe2/uniques.json")
    uniques: ItemDict = json.loads(response.read())

    for unique in uniques.values():
        save_image(unique, "public/assets/items/uniques")
    for base in base_items.values():
        save_image(base, "public/assets/items/basetypes")


anomalous_uniques = [
    "Sekhema's Resolve",
    "Grand Spectrum",
]


def save_image(item: Item, path: str):
    name = item["name"]
    if name in anomalous_uniques:
        name = item["visual_identity"]["dds_file"].split(
            "/")[-1].replace(".dds", "")

    full_path = os.path.join(path, encode(name) + ".webp")
    if os.path.isfile(full_path):
        return
    url = "https://repoe-fork.github.io/poe2/" + \
        item["visual_identity"]["dds_file"].replace('.dds', '.webp')
    try:
        response = request.urlopen(url)
        with open(full_path, "wb") as file:
            file.write(response.read())
    except Exception as e:
        print("could not download", url)


# def download_and_save_image(file_path: str, item: dict):
#     if os.path.isfile(file_path):   # dont download if icon already exists
#         return
#     icon_url = "https://media.githubusercontent.com/media/lvlvllvlvllvlvl/RePoE/master/RePoE/data/" + \
#         item["visual_identity"]["dds_file"].replace(".dds", ".png")
#     response = requests.get(icon_url)
#     if item.get("item_class") == "Flask":  # flasks icons need to be assembled first
#         generate_flask_image(BytesIO(response.content)).save(file_path)
#     else:
#         with open(file_path, "wb") as file:
#             file.write(response.content)
if __name__ == "__main__":
    prepare()
