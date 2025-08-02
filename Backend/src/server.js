// It requires the dotenv package to load environment variables
require("dotenv").config();

// It then imports the Express application setup from app.js
const app = require("./app");

// Define the port for the server to listen on.
const PORT = process.env.PORT;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
