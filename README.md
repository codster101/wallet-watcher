# wallet-watcher
Web server and web app for a budget application

## Installation and Setup
Run git clone <url> in the directory you want this repository stored in

Copy the wallet_watcher.env.example file to a file named wallet_watcher.env and provide a value for each environment variable

Run docker compose -f compose.prod.yaml up --build

## Updating
Run git pull

Run docker compose -f compose.prod.yaml down

Run docker compose -f compose.prod.yaml up --build
