# Frontend for BPL

## How to set up

Install node v23 and npm, run

```
echo "VITE_PUBLIC_BPL_BACKEND_URL = http://localhost/api" > .env
npm install
```

Alternatively you can set `VITE_PUBLIC_BPL_BACKEND_URL=https://v2202503259898322516.goodsrv.de/api` to directly work with the production backend instead of your own local one

## Icon generation

We download images from https://repoe-fork.github.io

Install python (latest probably works idk)

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r icon-generation/requirements.txt
python3 icon-generation/fetch_icons.py
```

## Updating the backend client

Run the backend go server on localhost and execute

```
./generate_client.sh
```

## Credits

- Some code in this project is derived from [pasteofexile](https://github.com/Dav1dde/pasteofexile), licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE for details.
- Icons are provided by [RePoE Fork](https://github.com/repoe-fork/repoe) and ultimately property of Grinding Gear Games
