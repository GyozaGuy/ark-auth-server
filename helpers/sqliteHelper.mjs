import Database from 'sqlite-async';

export async function addColumnToTable(tableName, column, type) {
  const db = await openDb();

  db.run(`ALTER TABLE ${tableName} ADD COLUMN ${column} ${type}`);
  db.close();
}

export async function createTableUnlessExists(tableName, definition) {
  const db = await openDb();

  db.run(
    `CREATE TABLE IF NOT EXISTS ${tableName} (${Object.entries(definition).reduce(
      (acc, [key, value]) => `${acc ? `${acc}, ` : ''}${key} ${value}`,
      ''
    )})`
  );

  db.close();
}

export async function deleteFromTable(tableName, keyValues) {
  const db = await openDb();
  const keyValueString = makeKeyValueString(keyValues);

  db.run(`DELETE FROM ${tableName} WHERE ${keyValueString}`);
  db.close();
}

export async function getAllByValuesFromTable(tableName, keyValues) {
  const db = await openDb();
  const keyValueString = makeKeyValueString(keyValues);
  const rows = await db.all(`SELECT * FROM ${tableName} WHERE ${keyValueString}`);

  db.close();
  return rows;
}

export async function getAllFromTable(tableName) {
  const db = await openDb();
  const rows = await db.all(`SELECT * FROM ${tableName}`);

  db.close();
  return rows;
}

export async function getByValuesFromTable(tableName, keyValues) {
  const db = await openDb();
  const keyValueString = makeKeyValueString(keyValues);
  const row = await db.get(`SELECT * FROM ${tableName} WHERE ${keyValueString}`);

  db.close();
  return row;
}

export async function insertValuesIntoTable(tableName, ...valuesList) {
  const db = await openDb();
  const stmt = await db.prepare(
    `INSERT INTO ${tableName} (${Object.keys(valuesList[0]).join(', ')}) VALUES (${Array(
      Object.values(valuesList[0]).length
    )
      .fill()
      .map(() => '?')
      .join(', ')})`
  );
  const stmtPromises = valuesList.map(values => stmt.run(Object.values(values)));

  await Promise.all(stmtPromises);
  await stmt.finalize();

  const row = await db.get(
    `SELECT * FROM ${tableName} WHERE id = (SELECT MAX(id) FROM ${tableName})`
  );

  db.close();
  return row;
}

export async function updateTable(tableName, newKeyValues, oldKeyValues) {
  const db = await openDb();
  const newKeyValueString = makeKeyValueString(newKeyValues, ', ');
  const oldKeyValueString = makeKeyValueString(oldKeyValues);

  db.run(`UPDATE ${tableName} SET ${newKeyValueString} WHERE ${oldKeyValueString}`);
  const row = await db.get(`SELECT * FROM ${tableName} WHERE ${makeKeyValueString(newKeyValues)}`);

  db.close();
  return row;
}

function makeKeyValueString(keyValues, delimiter = ' AND ') {
  return Object.entries(keyValues).reduce((acc, [key, value]) => {
    return `${acc ? `${acc}${delimiter}` : ''}${key} = '${
      typeof value === 'string' ? value.replace(/'/g, '\'\'') : value
    }'`;
  }, '');
}

function openDb() {
  return Database.open(`${process.env.DB_NAME || 'players'}.sqlite`);
}

export default {
  addColumnToTable,
  createTableUnlessExists,
  deleteFromTable,
  getAllByValuesFromTable,
  getAllFromTable,
  getByValuesFromTable,
  insertValuesIntoTable,
  updateTable
};
