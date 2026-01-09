import { BookOpen, Search, Bell, MessageSquare, User, Plus, Sparkles, Settings, LogOut, BookText } from 'lucide-react'
import { useState, useEffect } from 'react'
import CreateBookModal from './CreateBookModal'
import { api } from '../api/client'

export default function HeaderNarrative() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsCount, setNotificationsCount] = useState(3)
  const [messagesCount, setMessagesCount] = useState(5)

  // Загружаем пользователя при монтировании
  useEffect(() => {
    const loadUser = async () => {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (userData && token) {
        try {
          setUser(JSON.parse(userData))
          
          // Пробуем получить свежие данные профиля
          try {
            const profile = await api.getProfile()
            if (profile.success && profile.user) {
              setUser(profile.user)
              localStorage.setItem('user', JSON.stringify(profile.user))
            }
          } catch (profileError) {
            console.log('Не удалось обновить профиль:', profileError)
          }
        } catch (e) {
          console.error('Ошибка загрузки пользователя:', e)
        }
      }
    }
    
    loadUser()
    
    // Слушаем изменения в localStorage
    const handleStorageChange = () => loadUser()
    window.addEventListener('storage', handleStorageChange)
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Закрытие меню профиля при клике снаружи
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileElement = document.getElementById('profile-menu')
      const buttonElement = document.getElementById('profile-button')
      
      if (profileOpen && 
          profileElement && 
          buttonElement && 
          !profileElement.contains(event.target) && 
          !buttonElement.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  // Выход из системы
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setProfileOpen(false)
    window.location.href = '/login'
  }

  // Получение инициалов для аватара
  const getUserInitials = () => {
    if (!user) return '?'
    if (user.name) {
      return user.name.charAt(0).toUpperCase()
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return '?'
  }

  const getUserName = () => {
    if (!user) return 'Гость'
    return user.name || user.username || user.email?.split('@')[0] || 'Пользователь'
  }

  const getUserEmail = () => {
    if (!user) return 'Войдите в систему'
    return user.email || 'author@narrative.com'
  }

  // Обработка поиска
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Ищем:', searchQuery)
      // Здесь будет поиск по API
      alert(`Поиск: ${searchQuery}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  // Обработка создания книги
  const handleCreateBook = () => {
    if (!user) {
      alert('Для создания книги необходимо войти в систему')
      window.location.href = '/login'
      return
    }
    setIsCreateModalOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-narrative-paper-300/50 shadow-narrative">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Логотип Narrative */}
            <a 
              href="/" 
              className="flex items-center space-x-3 group cursor-pointer no-underline"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-narrative-blue-600 to-narrative-purple-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-narrative-blue-600 to-narrative-purple-600 p-2 rounded-xl shadow-md">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                 <h1 className="text-2xl font-bold bg-gradient-to-r from-narrative-blue-700 to-narrative-purple-700 bg-clip-text text-transparent drop-shadow-sm">
                      Narrative
                </h1>
                <p className="text-xs text-narrative-ink-500 hidden sm:block animate-pulse-soft">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Твоя история начинается здесь
                </p>
              </div>
            </a>

            {/* Поиск - адаптивный */}
            <div className={`hidden md:flex flex-1 max-w-xl mx-8 transition-all duration-300 ${searchOpen ? 'opacity-100' : 'opacity-90'}`}>
              <form onSubmit={handleSearch} className="relative w-full group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-narrative-ink-400 group-hover:text-narrative-blue-500 transition-colors duration-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Найти книгу, автора или жанр..."
                  className="input-narrative pl-12 pr-4 w-full"
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setSearchOpen(false)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs border border-narrative-paper-300 rounded bg-white text-narrative-ink-500">
                    ⌘K
                  </kbd>
                </div>
              </form>
            </div>

            {/* Действия */}
            <div className="flex items-center space-x-2">
              
              {/* Мобильный поиск */}
              <button 
                className="p-2.5 btn-narrative-ghost md:hidden rounded-narrative"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {/* Создать книгу */}
              <button
                onClick={handleCreateBook}
                className="btn-narrative px-4 py-2.5 whitespace-nowrap"
                disabled={!user}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Создать книгу</span>
                <span className="sm:hidden">Создать</span>
              </button>
              
              {/* Уведомления */}
              <button className="relative p-2.5 btn-narrative-ghost rounded-narrative group">
                <Bell className="h-5 w-5 text-narrative-ink-600 group-hover:text-narrative-blue-600 transition-colors duration-200" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-gradient-to-r from-narrative-purple-500 to-pink-500 rounded-full animate-pulse-soft"></span>
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-narrative-blue-500 to-narrative-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </span>
                )}
              </button>
              
              {/* Сообщения */}
              <button className="relative p-2.5 btn-narrative-ghost rounded-narrative group">
                <MessageSquare className="h-5 w-5 text-narrative-ink-600 group-hover:text-narrative-blue-600 transition-colors duration-200" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></span>
                {messagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {messagesCount > 9 ? '9+' : messagesCount}
                  </span>
                )}
              </button>
              
              {/* Профиль */}
              <div className="relative">
                <button
                  id="profile-button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="relative group focus:outline-none"
                  aria-label="Меню профиля"
                  aria-expanded={profileOpen}
                >
                  <div className="h-10 w-10 rounded-narrative bg-gradient-to-r from-narrative-blue-400 via-narrative-purple-400 to-pink-400 flex items-center justify-center text-white font-bold border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    {user ? (
                      <span className="relative z-10 text-lg font-bold">{getUserInitials()}</span>
                    ) : (
                      <User className="h-5 w-5 relative z-10" />
                    )}
                  </div>
                </button>
                
                {/* Выпадающее меню профиля */}
                {profileOpen && (
                  <div 
                    id="profile-menu"
                    className="absolute right-0 top-full mt-2 w-72 card-narrative shadow-narrative-lg z-50 animate-slide-in"
                  >
                    <div className="p-4 border-b border-narrative-paper-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-narrative bg-gradient-to-r from-narrative-blue-500 to-narrative-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {user ? getUserInitials() : <User className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-narrative-ink-900 truncate">
                            {user ? getUserName() : 'Гость'}
                          </p>
                          <p className="text-sm text-narrative-ink-500 truncate">
                            {getUserEmail()}
                          </p>
                          {user && (
                            <div className="flex items-center mt-1 space-x-1">
                              <span className="text-xs px-2 py-1 bg-narrative-blue-50 text-narrative-blue-700 rounded">
                                👑 Автор
                              </span>
                              <span className="text-xs px-2 py-1 bg-narrative-purple-50 text-narrative-purple-700 rounded">
                                📚 12 книг
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      {user ? (
                        <>
                          <a 
                            href="/profile" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-narrative text-narrative-ink-700 hover:bg-narrative-blue-50 hover:text-narrative-blue-700 transition-colors duration-200"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Мой профиль</span>
                          </a>
                          <a 
                            href="/my-books" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-narrative text-narrative-ink-700 hover:bg-narrative-blue-50 hover:text-narrative-blue-700 transition-colors duration-200"
                            onClick={() => setProfileOpen(false)}
                          >
                            <BookText className="h-4 w-4" />
                            <span>Мои книги</span>
                          </a>
                          <a 
                            href="/library" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-narrative text-narrative-ink-700 hover:bg-narrative-blue-50 hover:text-narrative-blue-700 transition-colors duration-200"
                            onClick={() => setProfileOpen(false)}
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Библиотека</span>
                          </a>
                          <a 
                            href="/settings" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-narrative text-narrative-ink-700 hover:bg-narrative-blue-50 hover:text-narrative-blue-700 transition-colors duration-200"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Настройки</span>
                          </a>
                          
                          <div className="border-t border-narrative-paper-200 mt-2 pt-2">
                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center justify-between px-4 py-3 text-red-600 hover:bg-red-50 rounded-narrative transition-colors duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <LogOut className="h-4 w-4" />
                                <span>Выйти из системы</span>
                              </div>
                              <span className="text-xs opacity-70">Esc</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <a 
                            href="/login" 
                            className="flex items-center justify-between px-4 py-3 rounded-narrative text-narrative-ink-700 hover:bg-narrative-blue-50 hover:text-narrative-blue-700 transition-colors duration-200"
                            onClick={() => setProfileOpen(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">🔑</span>
                              <span>Войти в аккаунт</span>
                            </div>
                            <span className="text-xs opacity-70">Ctrl+L</span>
                          </a>
                          <a 
                            href="/register" 
                            className="flex items-center justify-between px-4 py-3 rounded-narrative text-narrative-ink-700 hover:bg-narrative-blue-50 hover:text-narrative-blue-700 transition-colors duration-200"
                            onClick={() => setProfileOpen(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">📝</span>
                              <span>Зарегистрироваться</span>
                            </div>
                            <span className="text-xs opacity-70">Ctrl+R</span>
                          </a>
                        </>
                      )}
                    </div>
                    
                    {/* Футер меню */}
                    <div className="border-t border-narrative-paper-200 p-3 bg-narrative-paper-50 rounded-b-narrative">
                      <div className="flex items-center justify-between text-xs text-narrative-ink-500">
                        <span>Narrative v1.0</span>
                        <a 
                          href="/help" 
                          className="hover:text-narrative-blue-600 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          Помощь
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Мобильный поиск (раскрывающийся) */}
          {searchOpen && (
            <div className="mt-3 md:hidden animate-slide-in">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-narrative-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Искать книги, авторов, истории..."
                  className="input-narrative pl-12 pr-4 w-full"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-narrative-ink-400 hover:text-narrative-ink-600"
                >
                  ✕
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Модальное окно создания книги */}
      <CreateBookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookCreated={() => {
          console.log('Книга создана успешно!')
          // Можно добавить уведомление или обновление данных
          alert('Книга создана! Теперь вы можете добавить главы.')
        }}
      />
    </>
  )
}