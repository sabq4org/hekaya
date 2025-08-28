import Link from "next/link"
import { Sparkles, Mail, MessageCircle, Rss } from "lucide-react"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className={`${ibmPlexArabic.className} bg-white dark:bg-gray-900 dark:border-gray-700`}
      style={{ borderTop: '1px solid #f0f0ef' }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                حكاية AI
              </div>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم. نقدم محتوى عربي متميز عن الذكاء الاصطناعي وتطبيقاته.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2 mt-4">
              <Link 
                href="#" 
                className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-gray-100 dark:bg-gray-800"
              >
                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link 
                href="#" 
                className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-gray-100 dark:bg-gray-800"
              >
                <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link 
                href="/rss.xml" 
                className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-gray-100 dark:bg-gray-800"
              >
                <Rss className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  المقالات
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  عن الموقع
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  RSS
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">قانوني</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  سياسة الكوكيز
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div 
          className="mt-12 pt-8 text-center text-sm text-gray-600 dark:text-gray-400 dark:border-gray-700"
          style={{ borderTop: '1px solid #f0f0ef' }}
        >
          <p>
            © {currentYear} حكاية AI. جميع الحقوق محفوظة. صُنع بـ ❤️ في السعودية 🇸🇦
          </p>
        </div>
      </div>
    </footer>
  )
}