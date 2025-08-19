// Import necessary modules
const bcrypt = require("bcryptjs"); // Library for hashing and comparing passwords
const jwt = require("jsonwebtoken"); // Library for creating and verifying JSON Web Tokens (JWTs)
const userModel = require("../models/userModel");
const { jwtSecret, jwtExpiration } = require("../config/jwt"); // JWT configuration (secret key and expiration time)

// ======================================================================
// 1. Controller function for user registration (POST /api/auth/register)
//    Handles new user signup.
// ======================================================================
async function register(req, res) {
  // Extract username, email, and password from the request body sent by the frontend
  const { username, email, password } = req.body;

  // --- Input Validation ---
  // Check if all required fields are provided. If not, send a 400 Bad Request error.
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {
    // --- Check for Existing User ---
    // Call the userModel to check if a user with the given email already exists in the database.
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      // If user exists, send a 400 Bad Request error.
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // --- Password Hashing ---
    // Generate a salt (random string) to add complexity to the hash.
    // The '10' is the cost factor; higher means more secure but slower hashing.
    const salt = await bcrypt.genSalt(10);
    // Hash the plain-text password using the generated salt.
    const passwordHash = await bcrypt.hash(password, salt);

    // --- Create User in Database ---
    // Call the userModel to insert the new user's data (including the hashed password)
    // into the 'users' table. This returns the ID of the newly created user.
    const newUserId = await userModel.createUser(username, email, passwordHash);

    // --- Generate JWT ---
    // Create a JSON Web Token (JWT) for the newly registered user.
    // This token will be sent to the frontend and used for authentication in subsequent requests.
    // The payload contains the user's ID, which we'll use to identify the user later.
    const token = jwt.sign({ id: newUserId }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    // --- Send Success Response ---
    // Send a 201 Created status code with a success message, the generated token,
    // and basic user information (ID and username) back to the frontend.
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUserId,
        username,
      },
    });
  } catch (error) {
    // --- Error Handling ---
    // If any error occurs during the process (e.g., database error),
    // log it to the console for debugging and send a generic 500 Internal Server Error response.
    console.error("Error during user registration:", error);
    res
      .status(500)
      .json({ error: "Internal server error during registration" });
  }
}

// ======================================================================
// 2. Controller function for user login (POST /api/auth/login)
//    Handles existing user authentication.
// ======================================================================
async function login(req, res) {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // --- Input Validation ---
  // Check if email and password are provided.
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {
    // --- Find User ---
    // Call the userModel to find the user by their email in the database.
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      // If no user is found with that email, send a 400 Bad Request error (invalid credentials).
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // --- Password Comparison ---
    // Compare the plain-text password provided by the user with the hashed password stored in the database.
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // If passwords don't match, send a 400 Bad Request error (invalid credentials).
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // --- Generate JWT ---
    // If credentials are valid, create and sign a new JWT for the authenticated user.
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    // --- Send Success Response ---
    // Send a 200 OK status code with a success message, the token,
    // and basic user information back to the frontend.
    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    // --- Error Handling ---
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
}

// ======================================================================
// 3. Controller function to check if a user is authenticated (GET /api/auth/check)
//    This route is intended to be protected by middleware later.
//    It retrieves user details based on the ID from a valid JWT.
// ======================================================================
async function checkUser(req, res) {
  try {
    // In a real protected route, `req.user.id` would be populated by an authentication middleware
    // that verifies the JWT token from the request header.
    // For now, if we're testing this directly without the middleware, req.user might be undefined.
    // We will add the middleware in the next step.
    const userId = req.user ? req.user.id : null; // Safely get user ID if available

    if (!userId) {
      return res
        .status(401)
        .json({ message: "No user ID found in token. Not authenticated." });
    }

    // Find the user's public details from the database using the ID from the token.
    const user = await userModel.findUserById(userId);
    if (!user) {
      // This case might happen if a user was deleted but their token is still valid.
      return res.status(404).json({ message: "User not found" });
    }

    // Send a success response with the user's public details.
    res.status(200).json({
      message: "User is authenticated",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Export the controller functions so they can be used by the routes file (authRoutes.js)
module.exports = {
  register,
  login,
  checkUser,
};
