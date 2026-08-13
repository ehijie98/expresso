const sqlite3 = require('sqlite3');
const db = require('./api/db');

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS Employee`);
    db.run(`CREATE TABLE IF NOT EXISTS Employee (
        id INTEGER NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        wage INTEGER NOT NULL,
        is_current_employee INTEGER NOT NULL DEFAULT 1
        )`);

})
