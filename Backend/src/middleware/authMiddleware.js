const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library for token verification
const { jwtSecret } = require("../config/jwt"); // Import your JWT secret key from the configuration

/**
 * Middleware function to protect routes that require authentication.
 * It expects a JWT in the 'Authorization' header (e.g., "Bearer YOUR_TOKEN_HERE").
 * If the token is valid, it decodes the user ID and attaches it to the request object (`req.user.id`).
 * If the token is missing or invalid, it sends an unauthorized response.
 */
function protect(req, res, next) {
  let token; // Declare a variable to hold the token

  // 1. Check if the Authorization header exists and starts with 'Bearer'
  // This is the standard way to send JWTs in HTTP headers.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract the token string (remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the token using the secret key
      // jwt.verify() will throw an error if the token is invalid or expired.
      const decoded = jwt.verify(token, jwtSecret);

      // 4. Attach the user's ID from the decoded token payload to the request object
      // This makes the user's ID available in subsequent controller functions.
      req.user = { id: decoded.id };

      // 5. Call the 'next' middleware or the final route handler
      // This allows the request to proceed to the intended API endpoint.
      next();
    } catch (error) {
      // If token verification fails (e.g., expired token, malformed token),
      // log the error and send a 401 Unauthorized response.
      console.error("Token verification failed:", error.message);
      res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  // If no token was found in the Authorization header at all
  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
}

// Export the 'protect' middleware function so it can be used in your routes
module.exports = { protect };
