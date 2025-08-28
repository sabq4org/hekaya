import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "@/components/layout-content";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/session-provider";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "حكاية AI - منصة المحتوى العربي للذكاء الاصطناعي",
    template: "%s | حكاية AI"
  },
  description: "حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم",
  keywords: ["الذكاء الاصطناعي", "تعلم الآلة", "التقنية", "الابتكار", "البرمجة"],
  authors: [{ name: "فريق حكاية AI" }],
  creator: "حكاية AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hekaya-ai.com'),
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hekaya-ai.com',
    siteName: "حكاية AI",
    title: "حكاية AI - منصة المحتوى العربي للذكاء الاصطناعي",
    description: "حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم",
  },
  twitter: {
    card: "summary_large_image",
    title: "حكاية AI - منصة المحتوى العربي للذكاء الاصطناعي",
    description: "حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${notoSansArabic.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

