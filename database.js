const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database/examsphere.db');
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
const sampleDataPath = path.resolve(__dirname, '../../database/sample_data.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database connection:', err.message);
    } else {
        console.log('Connected to SQLite database: examsphere.db');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schemaSql, (err) => {
                if (err) {
                    console.error('Failed to initialize schema:', err.message);
                } else {
                    console.log('Database schema verified/created.');
                    seedData();
                }
            });
        }
    });
}

function seedData() {
    if (fs.existsSync(sampleDataPath)) {
        const sampleSql = fs.readFileSync(sampleDataPath, 'utf8');
        db.exec(sampleSql, (err) => {
            if (err) {
                console.error('Error seeding initial data:', err.message);
            } else {
                console.log('Sample data populated successfully.');
            }
        });
    }
}

// Promise wrapper helper methods
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

module.exports = {
    db,
    query,
    get,
    run
};
