# Wallet Watcher
Web server and web app for a budget application

### Functionality
- Import transactions manually (or bulk upload with file, but the file format is hard-coded so probably won't work)
- See transactions vs. income per month
- Sort transactions by category and set your budget for each category
- Create rules to automatically assign categories to transactions based on the name of the transaction (more useful for bulk import)

## Installation and Setup
Run `git clone <url>` in the directory you want this repository stored in

Copy the wallet_watcher.env.example file to a file named wallet_watcher.env and provide a value for each environment variable

Run `docker compose -f compose.prod.yaml up --build`

## Updating
Run `git pull`

Run `docker compose -f compose.prod.yaml down`

Run `docker compose -f compose.prod.yaml up --build`
