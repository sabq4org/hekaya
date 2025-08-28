'use client'

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  User,
  Share2,
  Bookmark,
  Cpu,
  ChevronRight,
  Brain,
  Activity,
  Heart,
  Stethoscope,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// export const metadata: Metadata = {
//   title: 'الذكاء الاصطناعي في التشخيص الطبي: ثورة في دقة الكشف المبكر | حكاية AI',
//   description: 'اكتشف كيف يحدث الذكاء الاصطناعي ثورة في التشخيص الطبي، من الكشف المبكر عن السرطان إلى تشخيص أمراض العيون بدقة تفوق 97%.',
// }

export default function MedicalAIDiagnosisArticle() {
  return (
    <div className={`min-h-screen ${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a]`}>
      {/* Article Header */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              المقالات
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-gray-100">الذكاء الاصطناعي في التشخيص الطبي</span>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Article Meta */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gray-100 dark:bg-gray-800" style={{ borderRadius: '20px' }}>
              <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">الطب والذكاء الاصطناعي</span>
          </div>
          
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              الذكاء الاصطناعي في التشخيص الطبي: ثورة في دقة الكشف المبكر
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 pb-6 dark:border-gray-700" style={{ borderBottom: '1px solid #f0f0ef' }}>
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#8b5cf6' }}>
                  س
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">د. سارة الأحمد</p>
                  <p className="text-xs">أخصائية الذكاء الاصطناعي الطبي</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>28 أغسطس 2024</span>
            </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
              <span>8 دقائق قراءة</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>1,234 مشاهدة</span>
              </div>

              <div className="mr-auto flex gap-2">
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300" style={{ border: '1px solid #f0f0ef', borderRadius: '8px' }}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300" style={{ border: '1px solid #f0f0ef', borderRadius: '8px' }}>
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-96 lg:h-[500px] overflow-hidden mb-12" style={{ borderRadius: '12px' }}>
            <Image
              src="/images/ai-medical-diagnosis.jpg"
              alt="الذكاء الاصطناعي في التشخيص الطبي"
              fill
              className="object-cover"
              priority
            />
      </div>

      {/* Article Content */}
          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
            <CardContent className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                
                {/* Summary Box */}
                <div className="p-6 mb-8" className="bg-gray-50 dark:bg-gray-900" style={{ borderRight: '4px solid #8b5cf6', borderRadius: '8px' }}>
                  <p className="font-bold text-purple-600 dark:text-purple-400 mb-3">ملخص المقال</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                يستكشف هذا المقال كيف يحدث الذكاء الاصطناعي ثورة حقيقية في مجال التشخيص الطبي، من خلال تحقيق دقة تشخيصية تصل إلى 97% في بعض التطبيقات، وتمكين الكشف المبكر عن الأمراض قبل ظهور الأعراض. نناقش التطبيقات العملية في مختلف التخصصات الطبية، والتحديات المواجهة، ونستشرف مستقبل الطب الرقمي.
              </p>
            </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">مقدمة: عندما تلتقي التقنية بالطب</h2>
            
                <p className="text-gray-700 leading-relaxed mb-6">
              في عالم يتسارع فيه التطور التقني بوتيرة مذهلة، يبرز الذكاء الاصطناعي كأحد أهم الابتكارات التي تعيد تشكيل مجال الرعاية الصحية. فبينما كان التشخيص الطبي يعتمد تقليدياً على خبرة الأطباء وحدسهم الطبي، نشهد اليوم ثورة حقيقية تدمج بين الذكاء البشري والذكاء الاصطناعي لتحقيق دقة تشخيصية لم تكن ممكنة من قبل.
            </p>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 mt-8">التطبيقات الرئيسية للذكاء الاصطناعي في التشخيص</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <Card style={{ border: '1px solid #f0f0ef', backgroundColor: '#f8f8f7', borderRadius: '8px' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: '#f0f0ef' }}>
                          <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-lg">تشخيص السرطان</h3>
                      </div>
                      <p className="text-gray-600">
                        دقة تصل إلى 95% في الكشف المبكر عن سرطان الثدي والرئة من خلال تحليل الصور الطبية.
                      </p>
                    </CardContent>
                  </Card>

                  <Card style={{ border: '1px solid #f0f0ef', backgroundColor: '#f8f8f7', borderRadius: '8px' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: '#f0f0ef' }}>
                          <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-lg">أمراض القلب</h3>
            </div>
                      <p className="text-gray-600">
                        التنبؤ بالنوبات القلبية قبل حدوثها بـ 5 سنوات من خلال تحليل البيانات الصحية.
                      </p>
                    </CardContent>
                  </Card>

                  <Card style={{ border: '1px solid #f0f0ef', backgroundColor: '#f8f8f7', borderRadius: '8px' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: '#f0f0ef' }}>
                          <Eye className="w-6 h-6 text-purple-600" />
            </div>
                        <h3 className="font-bold text-lg">أمراض العيون</h3>
              </div>
                      <p className="text-gray-600">
                        تشخيص اعتلال الشبكية السكري بدقة 97% مما يساعد في منع فقدان البصر.
                      </p>
                    </CardContent>
                  </Card>

                  <Card style={{ border: '1px solid #f0f0ef', backgroundColor: '#f8f8f7', borderRadius: '8px' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: '#f0f0ef' }}>
                          <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
                        <h3 className="font-bold text-lg">الأمراض النادرة</h3>
              </div>
                      <p className="text-gray-600">
                        تحديد الأمراض النادرة التي قد يستغرق تشخيصها سنوات بالطرق التقليدية.
                      </p>
                    </CardContent>
                  </Card>
            </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 mt-8">كيف يعمل الذكاء الاصطناعي في التشخيص الطبي؟</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  يعتمد الذكاء الاصطناعي في التشخيص الطبي على تقنيات التعلم العميق (Deep Learning) والشبكات العصبية الاصطناعية (Neural Networks) التي تحاكي طريقة عمل الدماغ البشري. يتم تدريب هذه النماذج على ملايين الصور والبيانات الطبية، مما يمكنها من:
                </p>

                <ul className="list-disc list-inside text-gray-700 space-y-3 mr-6 mb-6">
                  <li>تحليل الصور الطبية بدقة تفوق العين البشرية</li>
                  <li>اكتشاف الأنماط المعقدة في البيانات الصحية</li>
                  <li>التنبؤ بتطور المرض ومساره المستقبلي</li>
                  <li>تقديم توصيات علاجية مخصصة لكل مريض</li>
                </ul>

                {/* Statistics Section */}
                <div className="my-12 p-8 text-center" style={{ backgroundColor: '#f8f8f7', borderRadius: '12px' }}>
                  <h3 className="text-2xl font-bold mb-8 text-gray-900">إحصائيات مذهلة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <div className="text-4xl font-bold text-purple-600 mb-2">97%</div>
                      <p className="text-gray-600">دقة تشخيص أمراض العيون</p>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-purple-600 mb-2">50%</div>
                      <p className="text-gray-600">تقليل الأخطاء التشخيصية</p>
              </div>
              <div>
                      <div className="text-4xl font-bold text-purple-600 mb-2">70%</div>
                      <p className="text-gray-600">توفير في وقت التشخيص</p>
                    </div>
              </div>
            </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 mt-8">التحديات والاعتبارات الأخلاقية</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  رغم الإنجازات المذهلة، يواجه تطبيق الذكاء الاصطناعي في التشخيص الطبي عدة تحديات:
                </p>

                <div className="space-y-4 mb-8">
                  <div className="p-4 border-r-4 border-red-500" style={{ backgroundColor: '#fff5f5', borderRadius: '8px' }}>
                    <h4 className="font-bold text-red-800 mb-2">خصوصية البيانات</h4>
                    <p className="text-red-700">حماية البيانات الصحية الحساسة للمرضى وضمان استخدامها الأخلاقي.</p>
            </div>

                  <div className="p-4 border-r-4 border-orange-500" style={{ backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                    <h4 className="font-bold text-orange-800 mb-2">الثقة والقبول</h4>
                    <p className="text-orange-700">بناء ثقة الأطباء والمرضى في القرارات التشخيصية للذكاء الاصطناعي.</p>
            </div>

                  <div className="p-4 border-r-4 border-blue-500" style={{ backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                    <h4 className="font-bold text-blue-800 mb-2">التنظيم والمعايير</h4>
                    <p className="text-blue-700">وضع معايير واضحة لاعتماد واستخدام تقنيات الذكاء الاصطناعي الطبية.</p>
                  </div>
          </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 mt-8">نظرة إلى المستقبل</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  يعد مستقبل الذكاء الاصطناعي في التشخيص الطبي واعداً ومثيراً. مع التطور المستمر في التقنيات والخوارزميات، نتوقع أن نشهد:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  {[
                    {
                      icon: <TrendingUp className="w-6 h-6" />,
                      title: "طب شخصي متقدم",
                      description: "علاجات مخصصة بناءً على الجينات والبيانات الصحية الفردية"
                    },
                    {
                      icon: <Heart className="w-6 h-6" />,
                      title: "تشخيص استباقي",
                      description: "التنبؤ بالأمراض قبل ظهور الأعراض بسنوات"
                    },
                    {
                      icon: <Brain className="w-6 h-6" />,
                      title: "مساعدين أذكياء",
                      description: "أنظمة ذكية تدعم الأطباء في اتخاذ القرارات السريرية"
                    },
                    {
                      icon: <Activity className="w-6 h-6" />,
                      title: "مراقبة مستمرة",
                      description: "أجهزة ذكية تراقب الصحة على مدار الساعة"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="p-3 rounded-full shrink-0" style={{ backgroundColor: '#f0f0ef', height: 'fit-content' }}>
                        <div className="text-purple-600">{item.icon}</div>
              </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
                  ))}
          </div>

                <div className="mt-12 p-6 text-center" style={{ backgroundColor: '#f0f0ef', borderRadius: '12px' }}>
                  <p className="text-lg font-medium text-gray-800">
                    "الذكاء الاصطناعي لن يحل محل الأطباء، ولكن الأطباء الذين يستخدمون الذكاء الاصطناعي سيحلون محل أولئك الذين لا يستخدمونه"
                  </p>
                  <p className="text-sm text-gray-600 mt-2">- د. إريك توبول، خبير الطب الرقمي</p>
                </div>

                  </div>
            </CardContent>
          </Card>

          {/* Author Bio */}
          <Card className="mt-8 bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">عن الكاتب</h3>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: '#8b5cf6' }}>
                  س
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">د. سارة الأحمد</h4>
                  <p className="text-sm text-gray-600 mb-2">أخصائية الذكاء الاصطناعي الطبي</p>
                  <p className="text-gray-700">
                    باحثة متخصصة في تطبيقات الذكاء الاصطناعي في الطب، حاصلة على الدكتوراه في الذكاء الاصطناعي الطبي من جامعة ستانفورد. نشرت أكثر من 20 بحثاً علمياً في مجال التشخيص الطبي بالذكاء الاصطناعي.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">مقالات ذات صلة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "مستقبل التعلم الآلي في الصناعات الحديثة",
                  category: "التعليم والتقنية",
                  readingTime: 7
                },
                {
                  title: "أخلاقيات الذكاء الاصطناعي في العصر الرقمي",
                  category: "الأخلاقيات",
                  readingTime: 6
                },
                {
                  title: "الذكاء الاصطناعي في الأمن السيبراني",
                  category: "الأمن السيبراني",
                  readingTime: 7
                }
              ].map((article, index) => (
                <Card key={index} className="hover:-translate-y-1 transition-all cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
                  <CardContent className="p-4">
                    <div className="text-sm text-purple-600 mb-2">{article.category}</div>
                    <h4 className="font-bold mb-2 hover:text-purple-600 transition-colors">{article.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{article.readingTime} دقائق</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}