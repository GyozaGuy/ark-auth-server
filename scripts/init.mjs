import { createTableUnlessExists } from '../helpers/sqliteHelper.mjs';

createTableUnlessExists('players', {
  allowedOnServer: 'INTEGER',
  discordId: 'STRING',
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  steamId: 'STRING'
});
