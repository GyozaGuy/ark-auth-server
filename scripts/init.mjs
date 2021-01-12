import { createTableUnlessExists } from '../helpers/sqliteHelper.mjs';

createTableUnlessExists('players', {
  allowedOnServer: 'INTEGER',
  discordId: 'TEXT',
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  steamId: 'TEXT'
});
