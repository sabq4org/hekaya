'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Target, Users, BookOpen, Heart, Rocket, Award, TrendingUp } from "lucide-react"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function AboutPage() {
  return (
    <div className={`min-h-screen ${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a]`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                عن حكاية AI
              </span>
              <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500 dark:text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              منصة عربية رائدة لنشر المعرفة في مجال الذكاء الاصطناعي، نحول التقنية المعقدة إلى قصص ملهمة
            </p>
          </div>

          {/* Vision Card */}
          <Card className="mb-12 bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl font-bold dark:text-gray-100">رؤيتنا</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                نسعى لأن نكون المرجع الأول للمحتوى العربي المتخصص في الذكاء الاصطناعي، 
                حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم. نؤمن أن كل شخص 
                يستحق فرصة فهم هذه التقنية الثورية والاستفادة منها في حياته اليومية.
              </p>
            </CardContent>
          </Card>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200 rounded-xl shadow-none">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-full mx-auto mb-4 w-fit bg-gray-100 dark:bg-gray-700">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-3 dark:text-gray-100">مهمتنا</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  تبسيط المفاهيم المعقدة وجعل الذكاء الاصطناعي متاحاً وسهل الفهم للجميع في العالم العربي
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200 rounded-xl shadow-none">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-full mx-auto mb-4 w-fit bg-gray-100 dark:bg-gray-700">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-3 dark:text-gray-100">مجتمعنا</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  نبني مجتمعاً عربياً واعياً ومتمكناً من أدوات المستقبل، يشارك المعرفة ويساهم في الابتكار
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200 rounded-xl shadow-none">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-full mx-auto mb-4 w-fit bg-gray-100 dark:bg-gray-700">
                  <BookOpen className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-lg font-bold mb-3 dark:text-gray-100">محتوانا</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  مقالات عميقة ومحدثة تواكب أحدث التطورات، مكتوبة بأسلوب سلس يجمع بين الدقة والبساطة
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Story Card */}
          <Card className="mb-12 bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200 rounded-xl shadow-none">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Rocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl font-bold dark:text-gray-100">قصتنا</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="text-lg leading-relaxed text-gray-700 mb-6">
                بدأت حكاية AI من شغف عميق بالتقنية ورغبة صادقة في نشر المعرفة باللغة العربية. 
                لاحظنا الفجوة الكبيرة بين المحتوى التقني المتاح بالإنجليزية ونظيره العربي، 
                فقررنا أن نكون جزءاً من الحل.
              </p>
              <p className="text-lg leading-relaxed text-gray-700 mb-6">
                نؤمن أن الذكاء الاصطناعي ليس مجرد تقنية، بل هو ثورة ستغير كل جوانب حياتنا. 
                من الطب إلى التعليم، ومن الأعمال إلى الفن، لا يوجد مجال لن يتأثر بهذه التقنية المذهلة.
              </p>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                من خلال مقالاتنا المتخصصة، نسعى لبناء جسر بين العلم والمجتمع، 
                ونقدم محتوى يجمع بين العمق العلمي والبساطة في الطرح، لنجعل من كل قارئ خبيراً في مجاله.
              </p>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: TrendingUp, number: "50+", label: "مقال متخصص", color: "text-blue-600" },
              { icon: Users, number: "10k+", label: "قارئ شهرياً", color: "text-purple-600" },
              { icon: Award, number: "95%", label: "رضا القراء", color: "text-pink-600" },
              { icon: Rocket, number: "100%", label: "محتوى أصلي", color: "text-green-600" }
            ].map((stat, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
                <CardContent className="p-6 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color} ${stat.color.replace('text-', 'dark:text-').replace('600', '400')}`} />
                  <div className="text-3xl font-bold mb-2 dark:text-gray-100">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Card */}
          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 dark:text-gray-100">انضم إلى رحلتنا</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                كن جزءاً من مجتمع حكاية AI واستكشف عالم الذكاء الاصطناعي معنا. 
                سواء كنت مبتدئاً أو خبيراً، ستجد محتوى يناسب مستواك ويثري معرفتك.
              </p>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/blog"
                  className="px-6 py-3 font-medium transition-all hover:-translate-y-0.5 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  style={{ 
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}
                >
                  اكتشف المقالات
                </a>
                <a 
                  href="/contact"
                  className="px-6 py-3 font-medium transition-all hover:-translate-y-0.5 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-700"
                  style={{ 
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}
                >
                  تواصل معنا
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}