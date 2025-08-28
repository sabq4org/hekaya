import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // جلب آخر 20 مقال منشور
    const posts = await prisma.post.findMany({
      where: { status: 'published' },
      include: {
        author: {
          select: { name: true, email: true }
        },
        category: {
          select: { name: true }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 20
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hekaya-ai.com'
    const buildDate = new Date().toUTCString()
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>حكاية AI - مدونة الذكاء الاصطناعي</title>
    <description>حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم</description>
    <link>${baseUrl}</link>
    <language>ar</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/images/logo.png</url>
      <title>حكاية AI</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    
    ${posts.map(post => {
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date(post.createdAt).toUTCString()
      const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <link>${baseUrl}/articles/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author.email} (${post.author.name})</author>
      <category><![CDATA[${post.category?.name || 'عام'}]]></category>
      ${post.featuredImage ? `<enclosure url="${post.featuredImage}" type="image/jpeg" />` : ''}
    </item>`
    }).join('')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}

