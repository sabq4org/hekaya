'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Rocket, 
  Brain,
  Cpu,
  Binary,
  Code,
  Lightbulb,
  Stars,
  Calendar,
  Clock,
  User
} from "lucide-react"
import { useState, useEffect } from "react"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [currentText, setCurrentText] = useState(0)
  
  const rotatingTexts = [
    "تعلم الآلة",
    "معالجة اللغة الطبيعية", 
    "الرؤية الحاسوبية",
    "الشبكات العصبية",
    "الذكاء الاصطناعي التوليدي"
  ]

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % rotatingTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "محتوى متخصص",
      description: "مقالات عميقة ومفصلة في مختلف مجالات الذكاء الاصطناعي"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "أحدث التقنيات",
      description: "نتابع آخر التطورات والابتكارات في عالم AI"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "تعلم تفاعلي",
      description: "شروحات مبسطة مع أمثلة عملية وتطبيقات واقعية"
    }
  ]

  const latestArticles = [
    {
      title: "الذكاء الاصطناعي في التشخيص الطبي: ثورة في دقة الكشف المبكر",
      description: "اكتشف كيف يحدث الذكاء الاصطناعي ثورة في التشخيص الطبي، من الكشف المبكر عن السرطان إلى تشخيص أمراض العيون بدقة تفوق 97%.",
      author: "د. سارة الأحمد",
      date: "28 أغسطس 2024",
      readingTime: 8,
      icon: <Cpu className="w-6 h-6" />,
      slug: "ai-medical-diagnosis"
    },
    {
      title: "مستقبل التعلم الآلي في الصناعات الحديثة",
      description: "رحلة استكشافية في عالم التعلم الآلي وتطبيقاته المستقبلية في مختلف الصناعات من الطب إلى الفضاء.",
      author: "م. أحمد محمد",
      date: "15 أغسطس 2024",
      readingTime: 7,
      icon: <Binary className="w-6 h-6" />,
      slug: "future-of-ai-in-education"
    },
    {
      title: "أخلاقيات الذكاء الاصطناعي في العصر الرقمي",
      description: "نقاش معمق حول التحديات الأخلاقية التي يطرحها تطور الذكاء الاصطناعي وكيفية وضع أطر تنظيمية فعالة.",
      author: "د. فاطمة الزهراء",
      date: "10 أغسطس 2024",
      readingTime: 6,
      icon: <Code className="w-6 h-6" />,
      slug: "ai-ethics"
    }
  ]

  return (
    <div className={`min-h-screen relative overflow-hidden ${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a]`}>
      {/* Minimal Background */}
      <div className="absolute inset-0 -z-10">
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-16 lg:py-24">
                  <div className="text-center max-w-5xl mx-auto">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                مرحباً بك في حكاية AI
              </span>
              <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500 dark:text-yellow-400 animate-pulse" />
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-4 font-medium">
            حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم.
          </p>

          {/* Rotating Text */}
          <div className="mb-20 h-8">
            {mounted && (
                              <p className="text-lg text-gray-600 dark:text-gray-400">
                استكشف عالم{" "}
                <span className="font-bold text-purple-600 dark:text-purple-400 transition-all duration-500">
                  {rotatingTexts[currentText]}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 dark:border-gray-700"
              style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex p-3 text-purple-600 dark:text-purple-400 bg-gray-100 dark:bg-gray-700" style={{ borderRadius: '8px' }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 dark:text-gray-100">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              أحدث الحكايات
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">اكتشف آخر ما كتبناه في عالم الذكاء الاصطناعي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {latestArticles.map((article, index) => (
            <Link href={`/articles/${article.slug}`} key={index}>
                              <Card 
                className="group transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full bg-white dark:bg-gray-800 dark:border-gray-700"
                style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 text-purple-600 dark:text-purple-400 shrink-0 bg-gray-100 dark:bg-gray-700" style={{ borderRadius: '8px' }}>
                      {article.icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 dark:text-gray-100">
                      {article.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-5 text-base leading-relaxed">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0 px-6 pb-6">
                  {/* Publication Info */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 dark:border-gray-700" style={{ borderTop: '1px solid #f0f0ef', paddingTop: '12px' }}>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readingTime} دقائق</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
            <CardContent className="p-8">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
              <h3 className="text-2xl font-bold mb-4 dark:text-gray-100">انضم إلى رحلة المعرفة</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                احصل على أحدث المقالات والأخبار في عالم الذكاء الاصطناعي
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-gray-100"
                  style={{ border: '1px solid #f0f0ef', borderRadius: '8px' }}
                />
                <Button variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600" style={{ borderColor: '#f0f0ef', borderWidth: '1px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: 'none' }}>
                  اشترك الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  )
}