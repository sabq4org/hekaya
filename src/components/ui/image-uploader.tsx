'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void
  acceptedTypes?: string
  maxSizeMB?: number
  className?: string
}

export default function ImageUploader({
  onImageUploaded,
  acceptedTypes = 'image/*',
  maxSizeMB = 10,
  className = '',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setError('يجب أن يكون الملف صورة')
      return
    }

    // التحقق من حجم الملف
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`حجم الصورة يجب أن يكون أقل من ${maxSizeMB}MB`)
      return
    }

    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadedImage(result.data.url)
        onImageUploaded?.(result.data.url)
      } else {
        setError(result.error || 'حدث خطأ أثناء رفع الصورة')
      }
    } catch {
      setError('حدث خطأ في الشبكة')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      uploadImage(imageFile)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* منطقة رفع الصورة */}
      {!uploadedImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200 min-h-[200px] flex flex-col items-center justify-center
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">جاري رفع الصورة...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-gray-100">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium mb-2">اسحب الصورة هنا أو انقر للاختيار</p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF حتى {maxSizeMB}MB
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span>اختيار صورة</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      ) : (
        /* عرض الصورة المرفوعة */
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={uploadedImage}
              alt="صورة مرفوعة"
              width={800}
              height={400}
              className="w-full h-auto max-h-[400px] object-cover"
            />
            
            {/* أزرار التحكم */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={removeImage}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="حذف الصورة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* مؤشر النجاح */}
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                <Check className="w-4 h-4" />
                <span>تم رفع الصورة</span>
              </div>
            </div>
          </div>
          
          {/* رابط الصورة */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">رابط الصورة:</p>
            <code className="text-xs bg-white p-2 rounded border break-all block">
              {uploadedImage}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}
