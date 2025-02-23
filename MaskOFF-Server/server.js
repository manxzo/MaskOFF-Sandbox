// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const WebSocket = require("ws");
const http = require("http");
const cookieParser = require("cookie-parser");

// Route Imports
const userRoutes = require("./routes/userRoutes"); // Registration, login, user profile endpoints
const friendRoutes = require("./routes/friendRoutes"); // Friend requests and friend list endpoints
const chatRoutes = require("./routes/chatRoutes"); // Chat endpoints (create chat, send message, etc.)
const postRoutes = require("./routes/postRoutes"); // Post endpoints (create, read, update, delete posts)
const jobRoutes = require("./routes/jobRoutes"); // Job endpoints (create, read, update, delete jobs)
// Create Express app and HTTP server
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(morgan("combined"));

// Set view engine if needed
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
});
app.use(limiter);

// Connect MongoDB using the URI from environment variables
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
});
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Mount API Routes
app.use("/api", userRoutes);
app.use("/api", friendRoutes);
app.use("/api", chatRoutes);
app.use("/api", postRoutes);
app.use("/api", jobRoutes);

// Root endpoint: Provide a list of active endpoints for reference
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MaskOFF" });
});

app.get("/api/endpoints", (req, res) => {
  res.json({
    endpoints: {
      // User-related endpoints
      register: "POST /api/register",
      verifyEmail: "GET /api/verify-email?userID=<userID>&token=<token>",
      forgotPassword: "POST /api/forgot-password",
      resetPassword: "POST /api/reset-password",
      login: "POST /api/users/login",
      getUser: "GET /api/user/:userID",
      updateProfile: "PUT /api/profile/:userID",
      listUsers: "GET /api/users",

      // Post-related endpoints
      createPost: "POST /api/posts",
      getPosts: "GET /api/posts",
      getPost: "GET /api/posts/:postID",
      updatePost: "PUT /api/posts/:postID",
      deletePost: "DELETE /api/posts/:postID",
      addComment: "POST /api/posts/:postID/comments",
      upvotePost: "POST /api/posts/:postID/upvote",
      downvotePost: "POST /api/posts/:postID/downvote",

      // Friend-related endpoints
      friendRequest: "POST /api/friends/request",
      friendRequestsReceived: "GET /api/friends/requests/received",
      friendRequestsSent: "GET /api/friends/requests/sent",
      acceptFriend: "POST /api/friends/accept",
      rejectFriend: "POST /api/friends/reject",
      friends: "GET /api/friends",

      // Chat-related endpoints
      createChat: "POST /api/chat/create",
      listChats: "GET /api/chats",
      sendMessage: "POST /api/chat/send",
      getMessages: "GET /api/chat/messages/:chatID",
      deleteMessage: "DELETE /api/chat/message/:chatID/:messageID",
      editMessage: "PUT /api/chat/message/:chatID/:messageID",
      deleteChat: "DELETE /api/chat/:chatID",
    },
  });
});

// Create WebSocket server using native ws module
const wss = new WebSocket.Server({ server });
app.locals.wss = wss; // Make it accessible in routes if needed

// Setup WebSocket server (mapping and notifications)
const { setupWebSocketServer } = require("./components/wsUtils");
setupWebSocketServer(wss);

// Start HTTP server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
