import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { api } from '../api/client'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔄 Проверяем доступность API...')
      
      // Проверяем здоровье API
      const health = await api.checkHealth()
      console.log('✅ API доступен:', health)
      
      // Пробуем авторизоваться
      console.log('🔄 Пытаемся войти...')
      const response = await api.login(formData.email, formData.password)
      console.log('✅ Ответ сервера:', response)
      
      // Сохраняем токен
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        setSuccess('Вход успешен! Перенаправляем...')
        
        // Через 2 секунды переходим на главную
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        setError('Не удалось получить токен авторизации')
      }
      
    } catch (err) {
      console.error('❌ Ошибка входа:', err)
      setError(err.message || 'Ошибка при входе. Проверьте консоль.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestClick = async () => {
    console.log('🧪 Тестируем API...')
    try {
      const health = await api.checkHealth()
      console.log('Тест API:', health)
      setSuccess('API работает! Проверьте консоль браузера.')
    } catch (err) {
      setError('API недоступен: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Карточка входа */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать
            </h1>
            <p className="text-gray-600">
              Войдите или создайте аккаунт, чтобы продолжить чтение.
            </p>
          </div>

          {/* Переключатель Вход/Регистрация */}
          <div className="flex mb-8">
            <button className="flex-1 py-3 text-center font-semibold text-primary-600 border-b-2 border-primary-600">
              Вход
            </button>
            <button className="flex-1 py-3 text-center font-semibold text-gray-500 border-b border-gray-200">
              Регистрация
            </button>
          </div>

          {/* Форма входа */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email поле */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email или Имя пользователя
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="author@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Пароль поле */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="********"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Сообщения об ошибке/успехе */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                ✅ {success}
              </div>
            )}

            {/* Запомнить меня и Забыли пароль */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-gray-700">Запомнить меня</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Забыли пароль?
              </a>
            </div>

            {/* Кнопка входа */}
             <button
                 type="submit"
                 disabled={loading}
                 className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                             font-semibold hover:bg-blue-700 transition-colors 
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Вход...
                </span>
              ) : 'Войти'}
            </button>

            {/* Тестовая кнопка */}
            <button
              type="button"
              onClick={handleTestClick}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
            >
              🧪 Тест подключения к API
            </button>

            {/* Разделитель */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ИЛИ ЧЕРЕЗ СОЦСЕТИ</span>
              </div>
            </div>

            {/* Кнопки соцсетей */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                <div className="h-5 w-5 bg-gray-800 rounded-full"></div>
                <span className="font-medium">Apple</span>
              </button>
            </div>

          </form>
        </div>

        {/* Призыв к регистрации */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Начните свою историю сегодня
          </p>
          <p className="text-gray-700">
            Присоединяйтесь к сообществу писателей.<br />
            Публикуйте романы, получайте отзывы и находите новые миры.
          </p>
          
          {/* Информация о сервере */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p>🌐 Сервер: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}</p>
            <p>📱 Откройте консоль браузера (F12) для логов</p>
          </div>
        </div>

      </div>
    </div>
  )
}