const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ======================================================================
// Nodemailer Transporter
// ======================================================================
const isEmailDebugEnabled = (process.env.EMAIL_DEBUG || "false") === "true";

const transporterOptions = process.env.EMAIL_HOST
  ? {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: (process.env.EMAIL_SECURE || "true") === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    }
  : {
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

if (isEmailDebugEnabled) {
  transporterOptions.logger = true;
  transporterOptions.debug = true;
}

const transporter = nodemailer.createTransport(transporterOptions);

if (isEmailDebugEnabled) {
  const { auth, ...rest } = transporterOptions; // Avoid logging the actual password
  const safeAuth = {
    ...auth,
    pass: auth && auth.pass ? "***redacted***" : undefined,
  };
  console.log("[Email] Transporter configured:", { ...rest, auth: safeAuth });
}

// ======================================================================
// 1. Function to register a new user
// ======================================================================
async function register(req, res) {
  const { username, email, password } = req.body; // Simple validation

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {
    // Check if user already exists
    const userExists = await authModel.findByEmail(email);
    if (userExists) {
      return res
        .status(400)
        .json({ error: "User with that email already exists." });
    } // Hash the password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Create the user

    const userId = await authModel.createUser(username, email, hashedPassword);

    res
      .status(201)
      .json({ message: "User registered successfully.", user_id: userId });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// ======================================================================
// 2. Function to log in a user
// ======================================================================
async function login(req, res) {
  const { email, password } = req.body; // Simple validation

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {
    // Check if user exists
    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    } // Compare passwords

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    } // Create and sign a JWT

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Logged in successfully.",
      token,
      username: user.username,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// ======================================================================
// 3. Function to request a password reset email
// ======================================================================
async function requestPasswordReset(req, res) {
  const { email } = req.body;

  try {
    const user = await authModel.findByEmail(email);
    if (!user) {
      // Send a success message even if the user doesn't exist to prevent email enumeration
      return res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }

    // --- NEW RATE-LIMITING LOGIC ---
    // Check if a reset request has been made recently (e.g., within the last 10 minutes).
    // This requires the 'password_reset_expires' field to be returned by your findByEmail model function.
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (
      user.password_reset_expires &&
      user.password_reset_expires > now &&
      user.password_reset_expires - now < tenMinutes
    ) {
      return res.status(200).json({
        message:
          "A password reset link has already been sent recently. Please check your email.",
      });
    } // Generate a reset token

    const token = crypto.randomBytes(32).toString("hex"); // Set the token's expiration time

    const expiration = Date.now() + 900000; // 15 minutes in milliseconds // Save the token and expiration to the user's record

    await authModel.saveResetToken(user.id, token, expiration); // Create the password reset link

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`; // Define the email content

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "HU Connect Password Reset Request",
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
<h2 style="color: #333;">Password Reset Request</h2>
<p>Hello ${user.username},</p>
<p>We received a request to reset your password for your HU Connect account. If you did not make this request, you can safely ignore this email.</p>
<a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
<p>This link will expire in 15 minutes.</p>
<p>If you have any questions, feel free to contact us.</p>
<hr style="border: none; border-top: 1px solid #ddd;">
 <p style="font-size: 12px; color: #777;">Thank you, <br>The HU Connect Team</p>
 </div>
`,
    }; // Send the email

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in password reset request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// ======================================================================
// 4. Function to handle the actual password reset
// ======================================================================
async function resetPassword(req, res) {
  const { token, newPassword } = req.body; // Simple validation

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required." });
  }

  try {
    // Find the user by the provided token
    const user = await authModel.findByResetToken(token);
    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired password reset token." });
    } // Check if the token has expired

    if (Date.now() > user.password_reset_expires) {
      return res
        .status(400)
        .json({ error: "Password reset token has expired." });
    } // Hash the new password before saving it

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Update the user's password and clear the reset token

    await authModel.updatePassword(user.id, hashedPassword);

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in password reset:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
