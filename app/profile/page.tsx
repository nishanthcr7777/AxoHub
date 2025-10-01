"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { WalletConnect } from "@/components/wallet-connect"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white"
            >
              Developer Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-1"
            >
              Manage your developer profile and contributions
            </motion.p>
          </div>
          <WalletConnect />
        </header>

        {/* Main content */}
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10 text-center">
                <div className="text-6xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-white mb-2">Profile Coming Soon</h2>
                <p className="text-slate-400">
                  Developer profiles, contribution history, and reputation system will be available in the next update.
                </p>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
