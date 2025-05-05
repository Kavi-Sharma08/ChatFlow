"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiClickData } from "emoji-picker-react";
import EmojiPicker from "emoji-picker-react";

type ClientMessage = {
  type: "message" | "join" | "typing" | "reaction" | "status";
  roomId: string;
  text?: string;
  userName?: string;
  targetIndex?: number;
  emoji?: string;
};

type ChatMessage = {
  text: string;
  fromSelf: boolean;
  userName: string;
  reaction?: string;
};

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const userName = searchParams.get("userName") || "Anonymous";

  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Changed to true
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001");
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "join", roomId, userName }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [...prev, { text: data.text, fromSelf: false, userName: data.userName }]);
      } else if (data.type === "typing") {
        setSomeoneTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setSomeoneTyping(false), 2000);
      } else if (data.type === "users") {
        setConnectedUsers(data.users);
      } else if (data.type === "reaction") {
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === data.targetIndex ? { ...msg, reaction: data.emoji } : msg
          )
        );
      } else if (data.type === "status") {
        setMessages((prev) => [
          ...prev,
          { text: `Status: ${data.text}`, fromSelf: false, userName: data.userName },
        ]);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [roomId, userName]);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = {
        type: "message",
        roomId,
        text: input,
        userName,
      };
      ws.current.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, { text: input, fromSelf: true, userName }]);
      setInput("");
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    ws.current?.send(JSON.stringify({ type: "typing", roomId, userName }));
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji);
    setEmojiPickerOpen(false);
  };

  const sendReaction = (index: number, emoji: string) => {
    ws.current?.send(
      JSON.stringify({
        type: "reaction",
        roomId,
        targetIndex: index,
        emoji,
      })
    );
  };

  const sendStatus = (status: string) => {
    ws.current?.send(
      JSON.stringify({
        type: "status",
        roomId,
        text: status,
        userName,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-64 bg-gray-800 p-4 border-r border-gray-700"
          >
            <h2 className="text-lg font-bold mb-4">Connected Users</h2>
            <ul className="space-y-2">
              {connectedUsers.map((user, idx) => (
                <li key={idx} className="text-sm text-gray-200">
                  🟢 {user}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <button onClick={() => sendStatus("brb")} className="bg-yellow-600 px-3 py-1 rounded w-full">
                BRB
              </button>
              <button onClick={() => sendStatus("busy")} className="bg-red-600 px-3 py-1 rounded w-full">
                Busy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
          <div>
            🔐 Room ID: <span className="font-mono">{roomId}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🧑‍🤝‍🧑 {connectedUsers.length} connected</span>
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              {sidebarOpen ? "Hide" : "Show"} Users
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow-md relative group cursor-pointer ${
                  msg.fromSelf ? "ml-auto bg-blue-600" : "mr-auto bg-gray-700"
                }`}
              >
                <div className="text-xs font-semibold mb-1">{msg.userName}</div>
                <div>{msg.text}</div>
                {msg.reaction && <div className="absolute -bottom-4 left-2">{msg.reaction}</div>}
                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => sendReaction(idx, "❤️")}>❤️</button>
                  <button onClick={() => sendReaction(idx, "😂")}>😂</button>
                  <button onClick={() => sendReaction(idx, "👍")}>👍</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {someoneTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm italic text-gray-400"
              >
                Typing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 flex flex-col gap-2 bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded text-black focus:outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              className="bg-yellow-500 px-3 py-2 rounded hover:bg-yellow-600"
            >
              😀
            </button>
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
          {emojiPickerOpen && (
            <div className="absolute bottom-20 left-4 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}