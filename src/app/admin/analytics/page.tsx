'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Calendar
} from 'lucide-react'

// Mock data للتحليلات
const trafficData = [
  { name: 'يناير', visits: 4000, pageViews: 12000, users: 2400 },
  { name: 'فبراير', visits: 3000, pageViews: 9000, users: 1398 },
  { name: 'مارس', visits: 5000, pageViews: 15000, users: 3200 },
  { name: 'أبريل', visits: 4500, pageViews: 13500, users: 2800 },
  { name: 'مايو', visits: 6000, pageViews: 18000, users: 3800 },
  { name: 'يونيو', visits: 5500, pageViews: 16500, users: 3500 },
  { name: 'يوليو', visits: 7000, pageViews: 21000, users: 4200 },
  { name: 'أغسطس', visits: 8000, pageViews: 24000, users: 4800 }
]

const deviceData = [
  { name: 'الهاتف المحمول', value: 65, color: '#3b82f6' },
  { name: 'سطح المكتب', value: 25, color: '#10b981' },
  { name: 'الجهاز اللوحي', value: 10, color: '#f59e0b' }
]

const topPosts = [
  { title: 'مستقبل الذكاء الاصطناعي في التعليم', views: 12543, engagement: 85 },
  { title: 'الذكاء الاصطناعي في التشخيص الطبي', views: 9876, engagement: 78 },
  { title: 'أخلاقيات الذكاء الاصطناعي', views: 7654, engagement: 82 },
  { title: 'مقدمة في تعلم الآلة', views: 6432, engagement: 75 },
  { title: 'تطبيقات الذكاء الاصطناعي في الأعمال', views: 5321, engagement: 70 }
]

const trafficSources = [
  { source: 'البحث العضوي', visits: 15234, percentage: 45.2, change: '+12%' },
  { source: 'وسائل التواصل الاجتماعي', visits: 9678, percentage: 28.7, change: '+8%' },
  { source: 'الروابط المباشرة', visits: 5123, percentage: 15.3, change: '-3%' },
  { source: 'البريد الإلكتروني', visits: 3654, percentage: 10.8, change: '+5%' }
]

const countries = [
  { name: 'السعودية', visits: 11876, percentage: 35.2 },
  { name: 'الإمارات', visits: 8321, percentage: 24.6 },
  { name: 'مصر', visits: 6123, percentage: 18.1 },
  { name: 'الكويت', visits: 3456, percentage: 10.2 },
  { name: 'قطر', visits: 2234, percentage: 6.6 },
  { name: 'أخرى', visits: 1789, percentage: 5.3 }
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('visits')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التحليلات والإحصائيات</h1>
          <p className="text-gray-600 mt-1">تحليل شامل لأداء الموقع وسلوك الزوار</p>
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 3 أشهر</option>
            <option value="1y">آخر سنة</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزيارات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مشاهدات الصفحات</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128,543</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت الجلسة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:32</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الارتداد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.1%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              -5.4% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>حركة الزيارات</CardTitle>
          <CardDescription>
            تطور الزيارات ومشاهدات الصفحات عبر الزمن
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="visits" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="الزيارات"
              />
              <Area 
                type="monotone" 
                dataKey="pageViews" 
                stackId="2" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="مشاهدات الصفحات"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأجهزة</CardTitle>
            <CardDescription>
              نسبة الزيارات حسب نوع الجهاز
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {deviceData.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: device.color }}
                    />
                    <span className="text-sm">{device.name}</span>
                  </div>
                  <span className="text-sm font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل المقالات أداءً</CardTitle>
            <CardDescription>
              المقالات الأكثر مشاهدة وتفاعلاً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span>{post.views.toLocaleString()} مشاهدة</span>
                      <span>{post.engagement}% تفاعل</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>مصادر الزيارات</CardTitle>
          <CardDescription>
            تحليل مصادر حركة الزيارات والتغييرات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-900">المصدر</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الزيارات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">النسبة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">التغيير</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map((source, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium">{source.source}</td>
                    <td className="py-4 px-4">{source.visits.toLocaleString()}</td>
                    <td className="py-4 px-4">{source.percentage}%</td>
                    <td className="py-4 px-4">
                      <span className={`text-sm ${source.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {source.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>التوزيع الجغرافي</CardTitle>
          <CardDescription>
            أفضل البلدان من حيث عدد الزيارات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{country.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {country.visits.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {country.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

