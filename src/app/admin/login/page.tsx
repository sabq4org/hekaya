'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@hekaya-ai.com')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (session && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(session.user.role)) {
      router.push('/admin')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('بيانات تسجيل الدخول غير صحيحة')
      } else if (result?.ok) {
        router.push('/admin')
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f8f7'
      }}>
        <div>جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f8f7',
      padding: '1rem'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0ef',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          تسجيل الدخول
        </h1>
        
        <p style={{ 
          textAlign: 'center',
          color: '#666',
          marginBottom: '1.5rem'
        }}>
          ادخل بياناتك للوصول إلى لوحة التحكم
        </p>
        
        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #f0f0ef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #f0f0ef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '100%',
              padding: '0.75rem',
              background: isLoading ? '#ccc' : 'linear-gradient(to right, #2563eb, #9333ea, #ec4899)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f0ef',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
            بيانات تجريبية:
          </p>
          <p style={{ color: '#666' }}>البريد: admin@hekaya-ai.com</p>
          <p style={{ color: '#666' }}>كلمة المرور: admin123</p>
        </div>
      </div>
    </div>
  )
}