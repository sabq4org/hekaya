import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

// Mock data for demonstration
const featuredPosts = [
  {
    id: "1",
    title: "الذكاء الاصطناعي في التشخيص الطبي: ثورة في دقة الكشف المبكر",
    summary: "اكتشف كيف يحدث الذكاء الاصطناعي ثورة في التشخيص الطبي، من الكشف المبكر عن السرطان إلى تشخيص أمراض العيون بدقة تفوق 97%.",
    author: "د. سارة الأحمد",
    publishedAt: "2025-08-28",
    readingTime: 8,
    coverImage: "/images/ai-medical-diagnosis.jpg",
    slug: "ai-medical-diagnosis"
  },
  {
    id: "2",
    title: "مستقبل الذكاء الاصطناعي في التعليم",
    summary: "كيف يمكن للذكاء الاصطناعي أن يحدث ثورة في طرق التعلم والتعليم، من التعلم المخصص إلى المساعدين الافتراضيين.",
    author: "أحمد محمد",
    publishedAt: "2024-01-15",
    readingTime: 7,
    coverImage: "/api/placeholder/600/300",
    slug: "future-of-ai-in-education"
  },
  {
    id: "3",
    title: "أخلاقيات الذكاء الاصطناعي",
    summary: "نقاش حول التحديات الأخلاقية التي يطرحها تطور الذكاء الاصطناعي وكيفية التعامل معها.",
    author: "سارة أحمد",
    publishedAt: "2024-01-10",
    readingTime: 6,
    coverImage: "/api/placeholder/600/300",
    slug: "ai-ethics"
  }
]

const categories = [
  { name: "تعلم الآلة", count: 15, slug: "machine-learning" },
  { name: "الرؤية الحاسوبية", count: 8, slug: "computer-vision" },
  { name: "معالجة اللغة", count: 12, slug: "nlp" },
  { name: "الروبوتات", count: 6, slug: "robotics" },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          مرحباً بك في حكاية AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          اكتشف عالم الذكاء الاصطناعي من خلال مقالات عربية متخصصة وشاملة. 
          نقدم لك أحدث التطورات والتطبيقات في عالم التقنية.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/blog">
              استكشف المقالات
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">تعرف علينا</Link>
          </Button>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">المقالات المميزة</h2>
          <Button variant="outline" asChild>
            <Link href="/blog">
              عرض الكل
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                  <span className="text-muted-foreground">صورة المقال</span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                  <Link href={`/articles/${post.slug}`}>
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readingTime} دقائق</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">التصنيفات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card key={category.slug} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} مقال
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">اشترك في النشرة البريدية</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          احصل على أحدث المقالات والتطورات في عالم الذكاء الاصطناعي مباشرة في بريدك الإلكتروني.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="بريدك الإلكتروني"
            className="flex-1 px-4 py-2 rounded-md border border-input bg-background"
          />
          <Button>اشتراك</Button>
        </div>
      </section>
    </div>
  )
}
