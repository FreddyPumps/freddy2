const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2'); // MySQL library
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Create MySQL connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'yourpassword', // Replace with your MySQL password
    database: 'leaderboard_db',
});

// Function to get country from IP address
async function getCountryFromIP(ip) {
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}/json?token=YOUR_API_KEY`);
        return response.data.country;
    } catch (error) {
        console.error('Error getting country from IP:', error);
        return 'Unknown';
    }
}

// Endpoint to update leaderboard
app.post('/update', async (req, res) => {
    const { ip, clicks } = req.body;

    const country = await getCountryFromIP(ip);

    // Check if the IP exists in the database
    db.query('SELECT * FROM leaderboard WHERE ip = ?', [ip], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            // Update clicks for the existing IP
            db.query('UPDATE leaderboard SET clicks = ? WHERE ip = ?', [clicks, ip], (err) => {
                if (err) {
                    console.error('Error updating the database:', err);
                    return res.status(500).send('Database error');
                }
                res.json({ message: 'Leaderboard updated' });
            });
        } else {
            // Insert new IP into the leaderboard
            db.query('INSERT INTO leaderboard (ip, country, clicks) VALUES (?, ?, ?)', [ip, country, clicks], (err) => {
                if (err) {
                    console.error('Error inserting into the database:', err);
                    return res.status(500).send('Database error');
                }
                res.json({ message: 'Leaderboard updated' });
            });
        }
    });
});

// Endpoint to get the leaderboard
app.get('/leaderboard', (req, res) => {
    db.query('SELECT * FROM leaderboard ORDER BY clicks DESC', (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Database error');
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
