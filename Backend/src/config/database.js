// Import the promise-based version of the mysql2 library
const mysql = require("mysql2/promise");

// This line loads environment variables from the .env file
// It must be at the top of the file to ensure variables are available
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true, // The pool will queue requests if all connections are in use
  connectionLimit: 10, // Maximum number of connections the pool will create
  queueLimit: 0, // No limit on queued requests
});

// Immediately test the database connection
// This is a good practice to ensure the server doesn't start if it can't connect
pool
  .getConnection()
  .then((connection) => {
    // If the connection is successful, a message is logged to the console
    console.log("Successfully connected to the MySQL database!");
    connection.release(); // Release the connection back to the pool
  })
  .catch((err) => {
    // If there's an error, log it and terminate the application
    console.error("Error connecting to the MySQL database:", err.message);
    // The process.exit(1) command stops the Node.js application
    // This is crucial because the app cannot function without a database connection
    process.exit(1);
  });

module.exports = pool;
