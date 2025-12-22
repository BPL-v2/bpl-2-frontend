import json
from typing import List
import requests
import os


def save_file(file_name, data):
    with open(os.path.join("public/assets/poe1/items", file_name + ".json"), "w") as f:
        f.write(json.dumps(data, separators=(",", ":"), sort_keys=True))
    # with open(os.path.join("", "wikidata", file_name + ".json"), "w") as f:
    #     f.write(json.dumps(data, indent=2, sort_keys=True))


def request_data_from_wiki(tables: list[str], fields: list[str], where: str = "", join_on: str = ""):
    items = []
    offset = 0
    while True:
        url = "https://www.poewiki.net/w/api.php?action=cargoquery"
        url += f"&tables={','.join(tables)}"
        url += f"&fields={','.join(fields)}"
        if where:
            url += f"&where={where}"
        if join_on:
            url += f"&join_on={join_on}"
        url += f"&limit=500"
        url += f"&offset={offset}"
        url += "&format=json"
        response = requests.get(url)
        results = response.json()["cargoquery"]
        items.extend(map_item(result["title"]) for result in results)
        if len(results) < 500:
            break
        offset += 500
    return items


def fix_explicit_stat_text(explicit_stat_text) -> List[List[str]]:
    # this will most likely break whenever the formatting in the wiki changes
    if not explicit_stat_text:
        return [[]]
    explicit_stat_text = explicit_stat_text.replace(
        "&lt;br /&gt;", "\n")  # replace line breaks in a single stat
    values = explicit_stat_text.split("&lt;br&gt;")  # separate stats
    value_lists = []
    for value in values:
        # indicates that there are multiple choices for a single stat
        if "mw-customcollapsible-31&quot;&gt;&lt;td&gt;" in value:
            value = value.split(
                "mw-customcollapsible-31&quot;&gt;&lt;td&gt;")[1]
            value = value.replace("&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;", "")
            value_lists.append(value.split(
                "&lt;hr style=&quot;width: 20%&quot;&gt;"))
        # also indicates that there are multiple choices for a single stat
        elif "&lt;hr style=&quot;width: 20%&quot;&gt;" in value:
            value_lists.append(value.split(
                "&lt;hr style=&quot;width: 20%&quot;&gt;"))
        else:
            value_lists.append([value])  # single choice for a stat
    return value_lists


def shorten_moster_metadata(metadata_id):
    return metadata_id.replace("Metadata/Monsters/", "")


def parameter_mapping(key, value):
    key = key.replace(" ", "_")
    if key in ["explicit_stat_text"]:   # html object that represents a list
        return fix_explicit_stat_text(value)
    if key in ["tags", "acquisition_tags"]:     # generic comma separated list
        return value.split(",") if value else []
    if key in ["is_drop_restricted", "drop_enabled"]:   # boolean
        return value == "1"
    if key in ["area_level", "tier"]:   # integer
        return int(value) if value else 0
    # list of metadata that needs to be shortened
    if key in ["boss_monster_ids", "drop_monsters", "drop_areas"]:
        if not value:
            return []
        return [shorten_moster_metadata(v) for v in value.split(",")]
    if key in ["metadata_id"]:  # metadata that needs to be shortened
        return shorten_moster_metadata(value)
    return value  # value does not need to be converted


def map_item(item):
    return {key.replace(" ", "_"): parameter_mapping(key, value) for key, value in item.items()}


def fetch_unique_items():
    table = "items"
    fields = ["name", "class_id", "base_item", "is_drop_restricted", "tags", "drop_text",
              "drop_enabled", "drop_monsters", "drop_areas", "explicit_stat_text", "acquisition_tags", "inventory_icon"]
    where = "rarity=%22Unique%22"
    data = request_data_from_wiki([table], fields, where, "")
    fixed = {
        item["name"]: {
            "base_item": item["base_item"],
            "is_drop_restricted": item["is_drop_restricted"],
            } for item in data if item["drop_enabled"] and item["class_id"] !="Map"
    }
    save_file("uniques", fixed)


def fetch_areas():
    fields = ["name", "area_level", "boss_monster_ids", "tags", "id"]
    table = "areas"
    where = "is_map_area=1"
    data = request_data_from_wiki([table], fields, where, "")
    save_file("areas", data)


def fetch_unique_monsters():
    fields = ["name", "metadata_id"]
    table = "monsters"
    where = "rarity=%22Unique%22"
    data = request_data_from_wiki([table], fields, where, "")
    save_file("unique_monsters", data)


def fetch_current_atlas_maps():
    tables = ["maps", "areas"]
    fields = ["areas.name", "maps.tier"]
    where = "areas.is_map_area AND maps.tier > 0 AND maps.series=\"Necropolis\" AND areas.name != \"The Shaper's Realm\""
    join_on = "areas.id = maps.area_id"
    data = request_data_from_wiki(tables, fields, where, join_on)
    save_file("atlas_maps", data)


def fetch_base_items():
    fields = ["name", "class_id", "base_item",
              "is_drop_restricted", "drop_enabled", "tags"]
    table = "items"
    unneeded_classids = ["Microtransaction", "HideoutDoodad", "QuestItem"]
    where = "rarity=%22Normal%22 AND class_id NOT IN ('" + "','".join(
        unneeded_classids) + "') "
    data = request_data_from_wiki([table], fields, where, "")
    save_file("base_items", data)




def fetch_wiki_data():
    fetch_unique_items()
    # fetch_unique_monsters()
    # fetch_areas()
    # fetch_current_atlas_maps()
    # fetch_base_items()


if __name__ == "__main__":
    fetch_wiki_data()
