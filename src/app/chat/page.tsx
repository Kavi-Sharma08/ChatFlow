"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

export default function RoomPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");

  const handleJoin = () => {
    if (roomId.trim() && userName.trim()) {
      router.push(`/chat/${roomId}/?userName=${userName}`);
    }
  };

  const handleCreate = () => {
    if (userName.trim()) {
      const newRoomId = uuid();
      router.push(`/chat/${newRoomId}/?userName=${userName}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Join or Create Room</h1>
      <input
        className="text-white p-2 rounded mb-4 border border-white w-64"
        placeholder="Enter Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
      />
      <input
        className="text-white p-2 rounded mb-4 border border-white w-64"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
      />
      <div className="flex gap-4">
        <button
          onClick={handleJoin}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          disabled={!roomId.trim() || !userName.trim()}
        >
          Join Room
        </button>
        <button
          onClick={handleCreate}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          disabled={!userName.trim()}
        >
          Create Room
        </button>
      </div>
    </div>
  );
}