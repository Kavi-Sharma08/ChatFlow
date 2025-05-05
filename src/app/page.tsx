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
    <div className="min-h-screen w-screen bg-slate-950 text-zinc-100 flex flex-col">
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
      <div className="font-bold text-2xl sm:text-3xl">ChatFlow</div>
      <div>
        <div className="block sm:hidden text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
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
              className="text-sm sm:text-lg font-medium bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent"
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
    <div className="w-full flex-1">
      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 w-full h-full">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full flex flex-col justify-center px-6 sm:px-12 md:px-24"
        >
          <div className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
            <h1>Connect in</h1>
            <h1>real-time</h1>
          </div>
          <div className="pt-4 sm:pt-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
            <p>Chat with friends, family and colleagues using</p>
            <p>our intuitive and secure messaging platform.</p>
            <p>No downloads, no hassle — just start chatting.</p>
          </div>
          <div className="pt-6 sm:pt-8">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full cursor-pointer font-medium shadow-md hover:bg-indigo-500 transition-all text-sm sm:text-base text-white"
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
          className="pt-8 sm:pt-11 flex justify-center items-center"
        >
          <img
            src="/image2.jpg"
            alt="Hero Image"
            className="w-[90%] sm:w-[80%] h-auto object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}

// Footer
function Footer() {
  const features = [
    { icon: <ImUsers size={24} className="text-indigo-400" />, text: "User Presence" },
    { icon: <IoChatbubblesOutline size={24} className="text-green-400" />, text: "Real-Time Chat" },
    { icon: <FaFaceGrin size={24} className="text-yellow-300" />, text: "Emoji Reactions" },
    { icon: <TiMessageTyping size={24} className="text-pink-400" />, text: "Typing Indicators" },
  ];

  return (
    <div className="w-full bg-slate-900 text-white py-6 sm:py-8">
      <div className="text-xl sm:text-2xl font-semibold flex justify-center mb-4 sm:mb-6">
        Why Choose ChatFlow?
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            className="bg-slate-800 p-4 sm:p-5 rounded-xl flex items-center gap-3 shadow hover:shadow-md transition-all"
          >
            {item.icon}
            <span className="text-sm sm:text-base">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}