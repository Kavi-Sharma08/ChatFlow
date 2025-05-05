"use strict";
// server/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var wss = new ws_1.WebSocketServer({ port: 3001 }, function () {
    console.log("✅ WebSocket server started on ws://localhost:3001");
});
wss.on("connection", function (ws) {
    console.log("🔌 Client connected");
    ws.on("message", function (message) {
        console.log("📨 Message received:", message.toString());
        // Broadcast to all connected clients
        wss.clients.forEach(function (client) {
            if (client !== ws && client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on("close", function () {
        console.log("❌ Client disconnected");
    });
});
