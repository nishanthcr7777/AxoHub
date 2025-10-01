"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  explorerLink?: string
}

export function SuccessModal({ isOpen, onClose, title, description, explorerLink }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-8 bg-black/80 backdrop-blur-sm border-green-500/30 max-w-md w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  ✓
                </motion.div>
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
              <p className="text-slate-300 mb-6">{description}</p>

              {explorerLink && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white mb-4 w-full"
                >
                  <a href={explorerLink} target="_blank" rel="noopener noreferrer">
                    View on Somnia Explorer
                  </a>
                </Button>
              )}

              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full bg-transparent"
              >
                Close
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
