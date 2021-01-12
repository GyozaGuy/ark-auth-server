import { createTableUnlessExists } from '../helpers/sqliteHelper.mjs';

createTableUnlessExists('players', {
  allowedOnServer: 'BOOLEAN',
  discordId: 'TEXT',
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  steamId: 'INTEGER'
});
