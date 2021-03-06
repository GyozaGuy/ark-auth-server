import setupDebug from 'debug';
import express from 'express';
import fetch from 'node-fetch';

import {
  deleteFromTable,
  getByValuesFromTable,
  insertValuesIntoTable,
  updateTable
} from '../helpers/sqliteHelper.mjs';

const debug = setupDebug('http');
const router = express.Router();
const validSteamIdRegex = /^\d{17}$/;

router.get('/authenticate', async (req, res) => {
  const steamId = req.query.steam_id;
  let allowedOnServer = false;
  let discordId;

  if (validSteamIdRegex.test(steamId)) {
    const player = await getByValuesFromTable('players', { steamId: steamId });
    allowedOnServer = Boolean(player?.allowedOnServer);
    discordId = player?.discordId || 'unknown';
  }

  const allowed = allowedOnServer ? '1' : '0';
  debug(`Auth status for ${discordId} (${steamId}): ${allowedOnServer}`);
  debug('Response:', { allowed, steam_id: steamId });
  res.status(200).json({ allowed, steam_id: steamId });

  // NOTE: Disabled (for now) to avoid duplicate "player joined" messages
  // if (allowed && process.env.WEBHOOK_URL) {
  //   fetch(process.env.WEBHOOK_URL, {
  //     body: JSON.stringify({
  //       content: `${discordId} has joined the server`
  //     }),
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     method: 'POST'
  //   });
  // }
});

router.delete('/players/:discordId', async (req, res) => {
  if (req.headers['auth-secret'] !== process.env.AUTH_SECRET) {
    debug(`Invalid auth secret: ${req.headers['auth-secret']}`);
    res.status(204).end();
  } else {
    const { discordId } = req.params;

    if (discordId) {
      const player = await getByValuesFromTable('players', { discordId });

      if (player) {
        debug(`Deleting data for player ${discordId}`);
        await deleteFromTable('players', { discordId });
        res.status(200).json({ message: 'Player successfully deleted' });
      } else {
        const message = `No player found with Discord ID ${discordId}`;
        debug(message);
        res.status(400).json({ message });
      }
    } else {
      debug('Discord ID required');
      res.status(400).json({ message: 'Discord ID required' });
    }
  }
});

router.get('/players/:id', async (req, res) => {
  const { id } = req.params;
  let discordId;
  let steamId;

  if (/^\d{17}$/.test(id)) {
    steamId = id;
  } else {
    discordId = id;
  }

  if (discordId || steamId) {
    const options = discordId ? { discordId } : { steamId };
    const player = await getByValuesFromTable('players', options);

    if (player) {
      res.status(200).json(player);
    } else {
      res.status(400).json({ message: `No data found for player ${id}` });
    }
  } else {
    res.status(400).json({ message: 'No ID provided' });
  }
});

router.post('/players/:discordId', async (req, res) => {
  if (req.headers['auth-secret'] !== process.env.AUTH_SECRET) {
    debug(`Invalid auth secret: ${req.headers['auth-secret']}`);
    res.status(204).end();
  } else {
    const { allowedOnServer, steamId } = req.body;
    const { discordId } = req.params;
    const player = await getByValuesFromTable('players', { discordId });

    if (player) {
      const updatedValues = { allowedOnServer: allowedOnServer ? 1 : 0 };

      if (validSteamIdRegex.test(steamId)) {
        updatedValues.steamId = steamId;
      }

      await updateTable('players', updatedValues, { discordId });
      debug(`Updated data for player ${discordId}`);
      res.status(200).json({ message: 'Player successfully updated' });
    } else if (discordId) {
      if (validSteamIdRegex.test(steamId)) {
        await insertValuesIntoTable('players', {
          allowedOnServer: allowedOnServer ? 1 : 0,
          discordId,
          steamId
        });
        debug(`Added data for player ${discordId} (${steamId})`);
        res.status(200).json({ message: 'Player successfully added' });
      } else {
        debug(`Invalid Steam ID for player ${discordId}`);
        res
          .status(400)
          .json({ message: 'Player not found, please provide a Steam ID the first time' });
      }
    } else {
      debug('No Discord ID provided');
      res.status(400).json({ message: 'Invalid request' });
    }
  }
});

export default router;
