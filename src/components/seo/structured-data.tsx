import Script from 'next/script'

interface ArticleStructuredDataProps {
  article: {
    title: string
    excerpt: string
    content: string
    slug: string
    publishedAt: string
    updatedAt: string
    featuredImage?: string
    author: {
      name: string
      bio?: string
    }
    category?: {
      name: string
    }
  }
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hekaya-ai.com'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.featuredImage ? [article.featuredImage] : [`${baseUrl}/images/default-og.jpg`],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "description": article.author.bio
    },
    "publisher": {
      "@type": "Organization",
      "name": "حكاية AI",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/articles/${article.slug}`
    },
    "articleSection": article.category?.name || "الذكاء الاصطناعي",
    "inLanguage": "ar",
    "wordCount": article.content.replace(/<[^>]*>/g, '').split(' ').length,
    "keywords": [
      "الذكاء الاصطناعي",
      "تعلم الآلة", 
      "التقنية",
      "الابتكار",
      article.category?.name
    ].filter(Boolean)
  }

  return (
    <Script
      id="article-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

interface WebsiteStructuredDataProps {
  title?: string
  description?: string
}

export function WebsiteStructuredData({ 
  title = "حكاية AI - مدونة الذكاء الاصطناعي",
  description = "حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم"
}: WebsiteStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hekaya-ai.com'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "description": description,
    "url": baseUrl,
    "inLanguage": "ar",
    "publisher": {
      "@type": "Organization",
      "name": "حكاية AI",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

interface OrganizationStructuredDataProps {
  // يمكن إضافة خصائص مستقبلية هنا
}

export function OrganizationStructuredData(_props: OrganizationStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hekaya-ai.com'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "حكاية AI",
    "description": "مدونة متخصصة في الذكاء الاصطناعي وتطبيقاته العملية",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
    "sameAs": [
      "https://twitter.com/hekaya_ai",
      "https://linkedin.com/company/hekaya-ai",
      "https://github.com/hekaya-ai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@hekaya-ai.com",
      "availableLanguage": ["Arabic", "English"]
    },
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Place",
      "name": "الشرق الأوسط وشمال أفريقيا"
    },
    "knowsAbout": [
      "الذكاء الاصطناعي",
      "تعلم الآلة",
      "معالجة اللغة الطبيعية",
      "رؤية الحاسوب",
      "التقنيات الناشئة"
    ]
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

