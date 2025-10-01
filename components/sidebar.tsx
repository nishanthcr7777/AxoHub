"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/submit-source", label: "Submit Source", icon: "📂" },
  { href: "/publish-package", label: "Publish Package", icon: "📦" },
  { href: "/browse-sources", label: "Browse Sources", icon: "🔍" },
  { href: "/browse-packages", label: "Browse Packages", icon: "🔗" },
  { href: "/profile", label: "Profile", icon: "👤" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-lime-400 bg-clip-text text-transparent"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 10px rgba(139, 92, 246, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.5)",
                "0 0 10px rgba(163, 230, 53, 0.5)",
                "0 0 20px rgba(139, 92, 246, 0.5)",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            AxoHub
          </motion.span>
        </motion.h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            >
              <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group",
                  isActive
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                )}
              >
                {/* Glow effect */}
                {(hoveredItem === item.href || isActive) && (
                  <motion.div
                    layoutId="sidebar-glow"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                <span className="text-lg relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
                <span className="relative z-10 font-medium">{item.label}</span>

                {/* Hover glow */}
                {hoveredItem === item.href && (
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <motion.div
          animate={{ x: [-100, 100] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="h-px w-20 bg-gradient-to-r from-purple-500 to-cyan-500 mt-1"
        />
      </div>
    </motion.div>
  )
}
