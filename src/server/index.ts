import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 }, () => {
  console.log("✅ WebSocket server started on ws://localhost:3001");
});

type ClientMeta = {
  socket: WebSocket;
  roomId: string;
  userName: string;
};

const rooms: Record<string, Set<string>> = {};
const clientMeta = new Map<WebSocket, ClientMeta>();

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === "join") {
      const roomId = data.roomId;
      const userName = data.userName || "Anonymous";

      clientMeta.set(ws, { socket: ws, roomId, userName });

      if (!rooms[roomId]) rooms[roomId] = new Set();
      rooms[roomId].add(userName);

      const userList = Array.from(rooms[roomId]);

      // Broadcast updated user list to all in room
      broadcastToRoom(roomId, {
        type: "users",
        users: userList,
      });
    }

    if (data.type === "message" || data.type === "typing") {
      const meta = clientMeta.get(ws);
      if (!meta) return;

      const message = {
        ...data,
        userName: meta.userName,
        roomId: meta.roomId,
      };

      // Broadcast to others in the same room
      broadcastToRoom(meta.roomId, message, ws);
    }

    if (data.type === "reaction") {
      const meta = clientMeta.get(ws);
      if (!meta) return;

      // Broadcast reaction (with target index and emoji) to others
      const reactionPayload = {
        type: "reaction",
        roomId: meta.roomId,
        targetIndex: data.targetIndex,
        emoji: data.emoji,
      };

      broadcastToRoom(meta.roomId, reactionPayload);
    }

    if (data.type === "status") {
      console.log(data)
      const meta = clientMeta.get(ws);
      if (!meta) return;

      // Broadcast status to everyone in the room
      const statusPayload = {
        type: "status",
        text: data.text,
        userName: meta.userName,
        roomId: meta.roomId,
      };

      broadcastToRoom(meta.roomId, statusPayload);
    }
  });

  ws.on("close", () => {
    const meta = clientMeta.get(ws);
    if (!meta) return;

    const { roomId, userName } = meta;
    clientMeta.delete(ws);

    if (rooms[roomId]) {
      rooms[roomId].delete(userName);
      const userList = Array.from(rooms[roomId]);

      // Broadcast updated user list to all in room
      broadcastToRoom(roomId, {
        type: "users",
        users: userList,
      });
    }
  });
});

// Helper: Broadcast to all clients in a room
function broadcastToRoom(roomId: string, message: any, excludeSocket?: WebSocket) {
  wss.clients.forEach((client) => {
    const meta = clientMeta.get(client);
    if (
      client.readyState === WebSocket.OPEN &&
      meta?.roomId === roomId &&
      client !== excludeSocket
    ) {
      client.send(JSON.stringify(message));
    }
  });
}
