const mysql = require('mysql2');
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'krasimir7',
  password: 'StrongP@ss123',
  database: 'currency_converter',
  port: 3306,
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});

// API route for currencies
app.get('/api/currencies', (req, res) => {
  connection.query('SELECT * FROM currencies', (error, results) => {
    if (error) {
      res.status(500).send('Error retrieving currencies');
    } else {
      res.json(results);
    }
  });
});

app.get('/api/exchange_rates', (req, res) => {
  const currencyFrom = req.query.currency_from;

  if (!currencyFrom) {
    return res.status(400).send('Currency from is required');
  }

  // Query the exchange_rates table
  connection.query('SELECT * FROM exchange_rates WHERE currency_from = ?', [currencyFrom], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).send('Error retrieving exchange rates');
    } else {
      if (results.length === 0) {
        return res.status(404).send('No exchange rates found for this currency');
      }
      res.json(results);
    }
  });
});

const port = 5001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});