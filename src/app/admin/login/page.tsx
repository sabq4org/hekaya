export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h1>
        <p className="text-center text-gray-600 mb-4">
          ادخل بياناتك للوصول إلى لوحة التحكم
        </p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin@hekaya-ai.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm">
          <p className="font-medium mb-2">بيانات تجريبية:</p>
          <p>البريد: admin@hekaya-ai.com</p>
          <p>كلمة المرور: admin123</p>
        </div>
      </div>
    </div>
  )
}

