### Frontend for BPL

## How to set up

Install node v23 and npm, run

```
touch .env
echo "VITE_BACKEND_URL = http://localhost/api" > .env
npm install
```

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
