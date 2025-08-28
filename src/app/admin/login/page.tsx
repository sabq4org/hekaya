export default function LoginPage() {
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
        
        <form action="/api/auth/signin" method="POST">
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
              name="email"
              defaultValue="admin@hekaya-ai.com"
              required
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #f0f0ef',
                borderRadius: '8px',
                fontSize: '1rem'
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
              name="password"
              defaultValue="admin123"
              required
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #f0f0ef',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            style={{ 
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(to right, #2563eb, #9333ea, #ec4899)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            تسجيل الدخول
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