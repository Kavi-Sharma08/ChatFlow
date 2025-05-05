"use client";
import { useState, useEffect } from "react";
import { IoChatbubblesOutline } from "react-icons/io5";
import { ImUsers } from "react-icons/im";
import { FaFaceGrin } from "react-icons/fa6";
import { TiMessageTyping } from "react-icons/ti";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Page Entry
export default function Home() {
  return (
    <div className="w-screen h-screen bg-slate-950 text-zinc-100">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}

// Navbar
function Navbar() {
  const taglines = [
    "Connect Instantly",
    "React with Emojis",
    "See Who's Typing",
    "Join the ChatFlow",
  ];
  const [currentTagline, setCurrentTagline] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[10%] bg-slate-900 text-white flex items-center justify-between px-4 sm:px-10">
      <div className="font-bold text-3xl">ChatFlow</div>
      <div>
        <div className="block sm:hidden text-sm font-medium bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          ChatFlow: Connect Now
        </div>
        <div className="hidden sm:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTagline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-medium bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent"
            >
              {taglines[currentTagline]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Hero Section
function Hero() {
  return (
    <div className="w-full min-h-[80%]">
      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 w-full h-[80%]">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full flex flex-col justify-center px-8 sm:px-24"
        >
          <div className="font-extrabold text-5xl sm:text-6xl text-white leading-tight">
            <h1>Connect in</h1>
            <h1>real-time</h1>
          </div>
          <div className="pt-6 text-lg text-zinc-300 leading-relaxed">
            <p>Chat with friends, family and colleagues using</p>
            <p>our intuitive and secure messaging platform.</p>
            <p>No downloads, no hassle — just start chatting.</p>
          </div>
          <div className="pt-8">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 px-8 py-4 rounded-full cursor-pointer font-medium shadow-md hover:bg-indigo-500 transition-all text-white"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-11 flex justify-center items-center"
        >
          <img
            src="/image2.jpg"
            alt="Hero Image"
            className="w-[80%] h-[100%] object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}

// Footer
function Footer() {
  const features = [
    { icon: <ImUsers size={28} className="text-indigo-400" />, text: "User Presence" },
    { icon: <IoChatbubblesOutline size={28} className="text-green-400" />, text: "Real-Time Chat" },
    { icon: <FaFaceGrin size={28} className="text-yellow-300" />, text: "Emoji Reactions" },
    { icon: <TiMessageTyping size={28} className="text-pink-400" />, text: "Typing Indicators" },
  ];

  return (
    <div className="w-full h-[40%] bg-slate-900 text-white">
      <div className="text-2xl font-semibold flex justify-center pt-6">
        Why Choose ChatFlow?
      </div>
      <div className="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-6 pt-8">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className="bg-slate-800 p-5 rounded-xl flex items-center gap-3 shadow hover:shadow-md transition-all"
          >
            {item.icon}
            <span>{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}