export default function SimpleLoginPage() {
  return (
    <div>
      <h1>تسجيل الدخول</h1>
      <p>صفحة تسجيل دخول بسيطة</p>
      <form>
        <input type="email" placeholder="البريد الإلكتروني" />
        <br />
        <input type="password" placeholder="كلمة المرور" />
        <br />
        <button type="submit">دخول</button>
      </form>
    </div>
  )
}
