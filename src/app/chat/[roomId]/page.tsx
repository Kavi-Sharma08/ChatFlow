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
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load messages from localStorage on mount
    const savedMessages = localStorage.getItem(`chatMessages_${roomId}`);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to false
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chatMessages_${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  useEffect(() => {
    ws.current = new WebSocket("https://chatflow-backend-1-urtv.onrender.com");
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "join", roomId, userName }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { text: data.text, fromSelf: false, userName: data.userName },
        ]);
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed md:static top-0 left-0 w-64 h-full bg-gray-800 p-4 border-r border-gray-700 z-50 md:z-0 shadow-lg md:shadow-none"
          >
            <h2 className="text-lg font-bold mb-4">Connected Users</h2>
            <ul className="space-y-2">
              {connectedUsers.map((user, idx) => (
                <li key={idx} className="text-sm text-gray-200 flex items-center gap-2">
                  <span className="text-green-400">🟢</span> {user}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => sendStatus("brb")}
                className="bg-yellow-600 px-3 py-1 rounded w-full hover:bg-yellow-500 transition"
              >
                BRB
              </button>
              <button
                onClick={() => sendStatus("busy")}
                className="bg-red-600 px-3 py-1 rounded w-full hover:bg-red-500 transition"
              >
                Busy
              </button>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden mt-4 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-gray-800 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white text-2xl"
            >
              ☰
            </button>
            <div className="text-sm sm:text-base">
              🔐 Room ID: <span className="font-mono">{roomId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm">🧑‍🤝‍🧑 {connectedUsers.length} connected</span>
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="hidden md:block bg-gray-700 px-2 sm:px-3 py-1 rounded hover:bg-gray-600 text-sm"
            >
              {sidebarOpen ? "Hide" : "Show"} Users
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-gray-900">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`max-w-[80%] sm:max-w-xs px-4 py-2 rounded-lg text-sm shadow-md relative group cursor-pointer ${
                  msg.fromSelf ? "ml-auto bg-blue-600" : "mr-auto bg-gray-700"
                } transition-all duration-200 hover:shadow-lg`}
              >
                <div className="text-xs font-semibold mb-1 text-gray-300">{msg.userName}</div>
                <div className="break-words">{msg.text}</div>
                {msg.reaction && (
                  <div className="absolute -bottom-4 left-2 text-lg">{msg.reaction}</div>
                )}
                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => sendReaction(idx, "❤️")}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => sendReaction(idx, "😂")}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    😂
                  </button>
                  <button
                    onClick={() => sendReaction(idx, "👍")}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    👍
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {someoneTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs sm:text-sm italic text-gray-400"
              >
                Typing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 flex flex-col gap-2 bg-gray-800 shadow-inner">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Type your message..."
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              className="bg-yellow-500 px-2 sm:px-3 py-2 rounded-lg hover:bg-yellow-600 transition text-lg"
            >
              😀
            </button>
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 sm:px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
            >
              Send
            </button>
          </div>
          {emojiPickerOpen && (
            <div className="absolute bottom-20 left-0 sm:left-4 z-50 w-full sm:w-auto px-2 sm:px-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" height={350} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}