# ark-auth-server

Basic auth server for ARK: Survival Evolved servers. This server is designed to be used with the Join Control mod: [https://steamcommunity.com/sharedfiles/filedetails/?id=949422684](https://steamcommunity.com/sharedfiles/filedetails/?id=949422684)

# Prerequisites

- git
- NodeJS version 14.8.0 (I recommend using NVM)
- sqlite3

# Installation

```shell
git clone git@github.com:GyozaGuy/ark-auth-server.git
cd ark-auth-server
npm install
```

# Setup

- Copy `.env.template` to `.env`
- Replace values in `.env` to your liking

## .env file values

- `AUTH_SECRET`: Some value of your choosing that the server will expect to be passed in as the `auth-secret` header to help secure the endpoints (it's only very basic security, but should be adequate for this purpose)
- `DB_NAME`: The name of the `.sqlite` file that will be generated, defaults to `players`
- `PORT`: The port to run the server on, defaults to `3000`

# Running the server

- Run `npm start` to run the server
- If you wish to see some debug output, run `npm run debug`

# Using the server

**All POST and DELETE requests must include the following header:**

```
auth-secret: the-same-value-you-put-in-the-.env-file-above
```

To add a user to the database, make a POST request to `/players/:playerName` with the following body:

```json
{
  "allowedOnServer": 1,
  "steamId": "12345678987654321"
}
```

`allowedOnServer` is an integer, `0` represents no server access and `1` represents having server access.

`steamId` represents the 17-digit Steam ID for the player that they will be using to join the server.

The Steam ID MUST be included when first adding a player to the database, but afterward any POST requests to update that user only need to include what you want to update.

To delete a user's data, make a DELETE request to `/players/:playerName`.

To view a user's current data, make a GET request to `/players/:playerName` (you can also open up this path in a browser to see it).

## Join Control endpoint

The path to use in your Join Control GameUserSettings.ini config is `/authenticate`. A sample Join Control config entry might look like the following:

```
[JoinControl]
URL=localhost:3000/authenticate
Kick=Not authorized
```
