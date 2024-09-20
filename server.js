const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Parse JSON bodies
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./leaderboard.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');

    // Create the leaderboard table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            event TEXT,
            score INTEGER,
            lineup TEXT,
            key TEXT
        )
    `);
});

function hex(buffer) {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
        const value = view.getUint32(i)
        const stringValue = value.toString(16)
        const padding = '00000000'
        const paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue);
    }
    return hexCodes.join("");
}
function sha256(string){
    var buffer = new TextEncoder("utf-8").encode(string)
    return crypto.subtle.digest("SHA-256", buffer).then(hash => {
        return hex(hash)
    })
}

// POST endpoint to add a new entry to the leaderboard
app.post('/leaderboard', (req, res) => {
    const { name, event, score, lineup, key } = req.body;

    console.log(req.body);

    // verify key is the sha256 hash of name + event + score + lineup
    const keyToVerify = name + event + score + JSON.stringify(lineup);
    sha256(keyToVerify).then(hash => {
        if (hash !== key) {
            return res.status(400).json({ error: 'Invalid key' });
        }
    });

    // Insert entry into the SQLite database
    const sql = `INSERT INTO leaderboard (name, event, score, lineup, key) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, event, score, JSON.stringify(lineup), key], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.sendStatus(201); // Entry added successfully
    });
});

// GET endpoint to retrieve the leaderboard for a specific event as JSON
app.get('/leaderboard/:event', (req, res) => {
    const event = req.params.event;
    
    // Query entries for the specific event
    const sql = `SELECT * FROM leaderboard WHERE event = ? ORDER BY score DESC`;
    db.all(sql, [event], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
