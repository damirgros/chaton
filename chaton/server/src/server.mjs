// server.mjs

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { Server } from "socket.io";
import http from "http";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize dotenv
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app); // Create an HTTP server
const io = new Server(server); // Attach socket.io to the HTTP server

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY || "default-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Socket.io setup
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle message sending
  socket.on("sendMessage", async ({ senderUsername, receiverUsername, message }) => {
    try {
      // Check if the sender and receiver exist
      const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
      const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

      if (!sender) {
        socket.emit("sendMessageError", { message: "Sender username does not exist." });
        return;
      }

      if (!receiver) {
        socket.emit("sendMessageError", { message: "Receiver username does not exist." });
        return;
      }

      // Create a new message in the database
      const newMessage = await prisma.message.create({
        data: {
          content: message,
          senderId: sender.id,
          receiverId: receiver.id,
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      // Ensure sender and receiver details are included in the emitted message
      const messageWithUsernames = {
        id: newMessage.id,
        content: newMessage.content,
        senderUsername: sender.username,
        receiverUsername: receiver.username,
        createdAt: newMessage.createdAt,
      };

      // Emit the message with usernames to the receiver and sender
      io.to(receiver.id).emit("receiveMessage", messageWithUsernames);
      io.to(sender.id).emit("receiveMessage", messageWithUsernames);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("sendMessageError", { message: "Internal server error." });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Passport Configuration
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register route
app.post(
  "/api/auth/register",
  [
    body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .trim(),
    body("username").optional().trim().escape(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { email, password, username } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
        },
      });

      req.login(newUser, (err) => {
        if (err) return res.status(500).json({ message: "Internal server error" });
        res.status(201).json({
          message: "User registered successfully",
          user: newUser,
          redirectUrl: `/user/${newUser.id}`,
        });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Login route
app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .trim(),
  ],
  handleValidationErrors,
  passport.authenticate("local"),
  (req, res) => {
    res.json({ message: "Login successful", user: req.user, redirectUrl: `/user/${req.user.id}` });
  }
);

// Logout route
app.get("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Fetch user data by ID
app.get("/api/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, receivedMessages: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Fetching messages route
app.get("/api/messages/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Add this route for sending messages
app.post("/api/messages/send", async (req, res) => {
  const { senderUsername, receiverUsername, message } = req.body;

  try {
    // Find the sender and receiver by username
    const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Invalid sender or receiver username" });
    }

    // Create a new message in the database
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });

    // Emit the new message to the receiver's socket
    io.to(receiver.id).emit("receiveMessage", newMessage);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Serve static files from Vite build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "build")));

// Serve the frontend application for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
