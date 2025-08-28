import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Role } from "@prisma/client"

// Temporary demo users (replace with database when ready)
const demoUsers = [
  {
    id: "1",
    email: "admin@hekaya-ai.com",
    name: "مدير الموقع",
    password: "admin123",
    role: "ADMIN" as Role
  },
  {
    id: "2", 
    email: "editor@hekaya-ai.com",
    name: "محرر المحتوى",
    password: "editor123",
    role: "EDITOR" as Role
  },
  {
    id: "3",
    email: "author@hekaya-ai.com", 
    name: "كاتب المقالات",
    password: "author123",
    role: "AUTHOR" as Role
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in demo data
        const user = demoUsers.find(u => u.email === credentials.email)
        
        if (!user) {
          return null
        }

        // Check password
        if (credentials.password !== user.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
      }
      return session
    }
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "temp-secret-for-development"
}

// Helper function to check if user has required role
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    [Role.READER]: 0,
    [Role.AUTHOR]: 1,
    [Role.EDITOR]: 2,
    [Role.ADMIN]: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

