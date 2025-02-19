// components/wsUtils.js
const WebSocket = require("ws");

let wss = null;
// Mapping of userID to their connected WebSocket instance
// (In a production system, you might want to support multiple sockets per user)
const userSockets = {};

/**
 * Sets up the WebSocket server by listening for new connections.
 * When a client connects, it expects an initial JSON message of the form:
 *   { type: "AUTH", userID: "..." }
 * This maps the userID to the WebSocket for sending targeted notifications.
 *
 * @param {WebSocket.Server} wsServer - The WebSocket server instance.
 */
const setupWebSocketServer = (wsServer) => {
  wss = wsServer;
  wsServer.on("connection", (ws, req) => {
    console.log("New WebSocket connection from", req.socket.remoteAddress);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "AUTH" && data.userID) {
          // Map the authenticated userID to this WebSocket connection.
          userSockets[data.userID] = ws;
          console.log(`User ${data.userID} authenticated on WebSocket`);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    ws.on("close", () => {
      // Remove this socket from our mapping.
      for (const userID in userSockets) {
        if (userSockets[userID] === ws) {
          delete userSockets[userID];
          console.log(`WebSocket for user ${userID} disconnected`);
          break;
        }
      }
    });
  });
};

/**
 * Sends a JSON payload to the connected client identified by userID.
 *
 * @param {String} userID - The user's unique identifier.
 * @param {Object} payload - The JSON payload to send.
 */
const sendToUser = (userID, payload) => {
  const socket = userSockets[userID];
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

/**
 * Sends a JSON payload to multiple userIDs.
 *
 * @param {Array<String>} userIDs - Array of user IDs.
 * @param {Object} payload - The JSON payload to send.
 */
const sendToUsers = (userIDs, payload) => {
  userIDs.forEach((userID) => {
    sendToUser(userID, payload);
  });
};

module.exports = { setupWebSocketServer, sendToUser, sendToUsers };
