'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, LogIn } from 'lucide-react'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('admin@hekaya-ai.com')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSimpleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // محاكاة تسجيل دخول بسيط
    if (email === 'admin@hekaya-ai.com' && password === 'admin123') {
      // تعيين كوكي بسيط للمصادقة
      document.cookie = 'auth-token=demo-admin-token; path=/; max-age=86400'
      
      alert('تم تسجيل الدخول بنجاح! سيتم توجيهك إلى صفحة رفع الصور.')
      
      // انتظار قصير ثم إعادة توجيه
      setTimeout(() => {
        router.push('/admin/posts/new')
      }, 1000)
    } else {
      alert('بيانات تسجيل الدخول غير صحيحة')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                حكاية AI
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              تسجيل الدخول
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ادخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSimpleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="أدخل كلمة المرور"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                بيانات تجريبية:
              </p>
              <div className="space-y-1 text-sm text-blue-600 dark:text-blue-300">
                <p><span className="font-medium">البريد:</span> admin@hekaya-ai.com</p>
                <p><span className="font-medium">كلمة المرور:</span> admin123</p>
              </div>
            </div>

            {/* Quick Access */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                أو 
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto ml-1 text-purple-600 dark:text-purple-400"
                  onClick={() => {
                    setEmail('admin@hekaya-ai.com')
                    setPassword('admin123')
                  }}
                >
                  املأ البيانات تلقائياً
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
