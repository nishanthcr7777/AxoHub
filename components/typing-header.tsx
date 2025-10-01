"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function TypingHeader() {
  const [displayText, setDisplayText] = useState("")
  const fullText = "The GitHub + npm of Web3, fully on-chain."

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 80)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-bold text-white mb-4"
      >
        Welcome to{" "}
        <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-lime-400 bg-clip-text text-transparent">
          AxoHub
        </span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-2xl text-slate-300 font-mono min-h-[2.5rem] flex items-center justify-center"
      >
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
          className="ml-1 text-purple-400"
        >
          |
        </motion.span>
      </motion.div>
    </div>
  )
}
