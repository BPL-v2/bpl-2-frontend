# Frontend for BPL

## How to set up

Install node v24 and npm, run

```
echo "VITE_PUBLIC_BPL_BACKEND_URL = http://localhost/api
# VITE_PUBLIC_BPL_BACKEND_URL = https://bpl-poe.com/api" > .env
npm install
```

If you want to run against our production api, just comment/uncomment the other url in the .env file

## Help, how do I log in for testing - I'm just getting redirected to bpl-poe.com

Just grab your JWT from https://bpl-poe.com by opening your dev tools going to localstorage and copying the auth value to localhost.

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
- A lot of the ladder code is inspired by features from [poe-ninja](https://poe.ninja/)
- Icons are provided by [RePoE Fork](https://github.com/repoe-fork/repoe) and ultimately property of Grinding Gear Games
