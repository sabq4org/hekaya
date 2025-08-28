'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Eye,
  MessageSquare,
  Calendar,
  ArrowUp,
  ArrowDown,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  BarChart3,
  Activity,
  Sparkles
} from 'lucide-react'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// Mock data
const overviewStats = [
  {
    title: 'الزيارات اليوم',
    value: '3,245',
    change: '+12%',
    trend: 'up',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900'
  },
  {
    title: 'المستخدمون الجدد',
    value: '128',
    change: '+23%',
    trend: 'up',
    icon: <Users className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900'
  },
  {
    title: 'متوسط مدة الجلسة',
    value: '5:42',
    change: '+5%',
    trend: 'up',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900'
  },
  {
    title: 'معدل الارتداد',
    value: '32%',
    change: '-8%',
    trend: 'down',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900'
  }
]

const topPosts = [
  {
    title: 'الذكاء الاصطناعي في التشخيص الطبي',
    views: 3420,
    change: '+15%',
    trend: 'up'
  },
  {
    title: 'مستقبل الذكاء الاصطناعي في التعليم',
    views: 2890,
    change: '+8%',
    trend: 'up'
  },
  {
    title: 'أخلاقيات الذكاء الاصطناعي',
    views: 2540,
    change: '-3%',
    trend: 'down'
  },
  {
    title: 'التعلم العميق وتطبيقاته',
    views: 2120,
    change: '+12%',
    trend: 'up'
  },
  {
    title: 'الروبوتات الذكية في الصناعة',
    views: 1890,
    change: '+5%',
    trend: 'up'
  }
]

const deviceStats = [
  { device: 'سطح المكتب', percentage: 58, icon: <Monitor className="w-5 h-5" /> },
  { device: 'الهاتف المحمول', percentage: 38, icon: <Smartphone className="w-5 h-5" /> },
  { device: 'الأجهزة اللوحية', percentage: 4, icon: <Smartphone className="w-5 h-5" /> }
]

const topCountries = [
  { country: 'السعودية', visits: 1245, flag: '🇸🇦' },
  { country: 'مصر', visits: 892, flag: '🇪🇬' },
  { country: 'الإمارات', visits: 654, flag: '🇦🇪' },
  { country: 'الأردن', visits: 423, flag: '🇯🇴' },
  { country: 'الكويت', visits: 321, flag: '🇰🇼' }
]

export default function AnalyticsPage() {
  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              التحليلات
            </h1>
            <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
              style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
            >
              اليوم
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
              style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
            >
              آخر 7 أيام
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
              style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
            >
              آخر 30 يوم
            </Button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">تتبع أداء موقعك وتحليل سلوك الزوار</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat, index) => (
          <Card 
            key={index}
            className="bg-white dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1 dark:text-gray-100">{stat.value}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Posts */}
        <Card 
          className="lg:col-span-2 bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
        >
          <CardHeader>
            <CardTitle className="dark:text-gray-100">المقالات الأكثر مشاهدة</CardTitle>
            <CardDescription className="dark:text-gray-400">أداء المقالات خلال الفترة المحددة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" style={{ border: '1px solid #f0f0ef' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold dark:text-gray-100">{post.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{post.views.toLocaleString()} مشاهدة</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${post.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {post.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{post.change}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card 
          className="bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
        >
          <CardHeader>
            <CardTitle className="dark:text-gray-100">الأجهزة</CardTitle>
            <CardDescription className="dark:text-gray-400">توزيع الزوار حسب نوع الجهاز</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deviceStats.map((device, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600 dark:text-gray-400">
                      {device.icon}
                    </div>
                    <span className="text-sm font-medium dark:text-gray-100">{device.device}</span>
                  </div>
                  <span className="text-sm font-bold dark:text-gray-100">{device.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Stats */}
      <Card 
        className="mt-8 bg-white dark:bg-gray-800 dark:border-gray-700"
        style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="dark:text-gray-100">التوزيع الجغرافي</CardTitle>
              <CardDescription className="dark:text-gray-400">الدول الأكثر زيارة لموقعك</CardDescription>
            </div>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topCountries.map((country, index) => (
              <div 
                key={index} 
                className="text-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                style={{ border: '1px solid #f0f0ef' }}
              >
                <div className="text-3xl mb-2">{country.flag}</div>
                <h4 className="font-semibold dark:text-gray-100">{country.country}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{country.visits.toLocaleString()} زيارة</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card 
          className="bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
        >
          <CardHeader>
            <CardTitle className="dark:text-gray-100">معدلات التفاعل</CardTitle>
            <CardDescription className="dark:text-gray-400">مؤشرات أداء المحتوى</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">معدل النقر</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3.2%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">معدل التحويل</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">1.8%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">معدل المشاركة</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">5.7%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">معدل العودة</span>
              <span className="text-sm font-bold text-pink-600 dark:text-pink-400">42%</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
        >
          <CardHeader>
            <CardTitle className="dark:text-gray-100">مصادر الزيارات</CardTitle>
            <CardDescription className="dark:text-gray-400">من أين يأتي زوارك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">البحث العضوي</span>
              <span className="text-sm font-bold dark:text-gray-100">45%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">مواقع التواصل</span>
              <span className="text-sm font-bold dark:text-gray-100">28%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">مباشر</span>
              <span className="text-sm font-bold dark:text-gray-100">15%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium dark:text-gray-100">الإحالة</span>
              <span className="text-sm font-bold dark:text-gray-100">12%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}