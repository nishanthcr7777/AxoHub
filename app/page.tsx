"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { WalletConnect } from "@/components/wallet-connect"
import { TypingHeader } from "@/components/typing-header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        {/* Header with wallet connection */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5">
          <div className="flex-1" />
          <WalletConnect />
        </header>

        {/* Main content */}
        <main className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <TypingHeader />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto"
            >
              Deploy, discover, and interact with smart contracts on the Somnia blockchain. The ultimate developer
              platform for decentralized applications.
            </motion.p>

            {/* Feature cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {[
                { title: "Submit Source", desc: "Upload and verify your smart contract source code", icon: "📂" },
                { title: "Publish Package", desc: "Create reusable packages from your contracts", icon: "📦" },
                { title: "Browse Sources", desc: "Explore verified contract source code", icon: "🔍" },
                { title: "Browse Packages", desc: "Discover and interact with packages", icon: "🔗" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 + index * 0.1, duration: 0.6 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
                  }}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
