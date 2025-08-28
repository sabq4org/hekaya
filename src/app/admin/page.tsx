"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, MessageSquare, Eye, TrendingUp, Calendar } from "lucide-react"

// Mock data for demonstration
const stats = [
  {
    title: "إجمالي المقالات",
    value: "24",
    description: "+2 هذا الأسبوع",
    icon: FileText,
    trend: "+12%"
  },
  {
    title: "المستخدمون النشطون",
    value: "1,234",
    description: "+180 هذا الشهر",
    icon: Users,
    trend: "+15%"
  },
  {
    title: "التعليقات",
    value: "89",
    description: "+12 اليوم",
    icon: MessageSquare,
    trend: "+8%"
  },
  {
    title: "المشاهدات",
    value: "12,543",
    description: "+1,234 هذا الأسبوع",
    icon: Eye,
    trend: "+23%"
  }
]

const recentPosts = [
  {
    title: "مستقبل الذكاء الاصطناعي في التعليم",
    status: "منشور",
    date: "2024-01-15",
    views: 1234
  },
  {
    title: "تطبيقات الذكاء الاصطناعي في الطب",
    status: "مسودة",
    date: "2024-01-14",
    views: 0
  },
  {
    title: "أخلاقيات الذكاء الاصطناعي",
    status: "قيد المراجعة",
    date: "2024-01-13",
    views: 567
  }
]

const recentComments = [
  {
    author: "أحمد محمد",
    content: "مقال رائع ومفيد جداً، شكراً لكم",
    post: "مستقبل الذكاء الاصطناعي",
    date: "منذ ساعتين"
  },
  {
    author: "فاطمة أحمد",
    content: "هل يمكن توضيح النقطة الثالثة أكثر؟",
    post: "تطبيقات الذكاء الاصطناعي",
    date: "منذ 4 ساعات"
  },
  {
    author: "محمد علي",
    content: "معلومات قيمة، أتطلع للمزيد",
    post: "أخلاقيات الذكاء الاصطناعي",
    date: "منذ يوم"
  }
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">
          نظرة عامة على أداء موقع حكاية AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                <span className="text-xs text-green-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Posts */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>المقالات الأخيرة</CardTitle>
            <CardDescription>
              آخر المقالات المنشورة والمسودات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === "منشور" 
                          ? "bg-green-100 text-green-800" 
                          : post.status === "مسودة"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {post.views}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>التعليقات الأخيرة</CardTitle>
            <CardDescription>
              آخر التعليقات على المقالات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComments.map((comment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.author}</p>
                    <p className="text-xs text-muted-foreground">{comment.date}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {comment.content}
                  </p>
                  <p className="text-xs text-primary">
                    على: {comment.post}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

