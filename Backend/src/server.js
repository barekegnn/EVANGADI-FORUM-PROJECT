// It requires the dotenv package to load environment variables
require("dotenv").config();

const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");

let SocketIOServer = null;
try {
  SocketIOServer = require("socket.io").Server;
} catch (err) {
  console.warn(
    "Socket.IO not installed; realtime notifications are disabled until dependencies are installed."
  );
}

const PORT = process.env.PORT;

const server = http.createServer(app);

if (SocketIOServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  // Simple JWT auth for sockets: clients pass { auth: { token: 'Bearer ...' } }
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.auth && socket.handshake.auth.token;
      if (!raw) return next(new Error("No token"));
      const token = raw.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    // Join a personal room for targeted notifications
    if (socket.user && socket.user.id) {
      socket.join(`user:${socket.user.id}`);
    }
  });

  // Helper to emit to a user; other modules can require this via app.get('io') pattern
  app.set("io", io);
} else {
  app.set("io", null);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
