"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string
  maxSize?: number
}

export function FileUpload({ onFileSelect, acceptedTypes = "*", maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setSelectedFile(file)
    setIsUploading(true)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setIsUploading(false)
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-4">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card
          className={`p-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragging
              ? "border-purple-500 bg-purple-500/10"
              : "border-slate-600 hover:border-purple-500/50 bg-slate-800/20"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center space-y-4">
            <motion.div animate={{ y: isDragging ? -5 : 0 }} className="text-6xl">
              📁
            </motion.div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isDragging ? "Drop your file here" : "Upload Package Metadata"}
              </h3>
              <p className="text-slate-400 text-sm">Drag and drop your file here, or click to browse</p>
              <p className="text-slate-500 text-xs mt-1">
                Accepted: {acceptedTypes} • Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {selectedFile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 bg-slate-800/30 border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-slate-400 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">{uploadProgress}%</span>
                </div>
              )}

              {!isUploading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                    setUploadProgress(0)
                  }}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Remove
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
