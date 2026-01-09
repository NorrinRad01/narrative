import { 
  Home, 
  Flame, 
  Star, 
  Grid, 
  Settings, 
  BookOpen, 
  Library, 
  User, 
  Users, 
  TrendingUp,
  Bookmark,
  FolderOpen,
  Archive,
  Compass,
  Heart,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

export default function SidebarNarrative() {
  const [activeSection, setActiveSection] = useState('feed')
  const [expandedSections, setExpandedSections] = useState({
    discover: true,
    myContent: true,
    reading: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const navItems = {
    main: [
      { id: 'feed', icon: Home, label: 'Лента', count: 24, active: true },
      { id: 'trending', icon: Flame, label: 'В тренде', count: 12 },
      { id: 'new', icon: Star, label: 'Новинки', badge: 'new' },
      { id: 'recommended', icon: Sparkles, label: 'Рекомендации' },
    ],
    discover: [
      { id: 'genres', icon: Compass, label: 'Жанры' },
      { id: 'popular', icon: TrendingUp, label: 'Популярное' },
      { id: 'authors', icon: Users, label: 'Авторы' },
      { id: 'collections', icon: Bookmark, label: 'Подборки' },
    ],
    myContent: [
      { id: 'my-books', icon: BookOpen, label: 'Мои книги', count: 5 },
      { id: 'drafts', icon: FolderOpen, label: 'Черновики', count: 3 },
      { id: 'published', icon: Library, label: 'Опубликовано', count: 2 },
      { id: 'archived', icon: Archive, label: 'Архив' },
    ],
    reading: [
      { id: 'reading-now', icon: BookOpen, label: 'Читаю сейчас' },
      { id: 'bookmarks', icon: Bookmark, label: 'Закладки', count: 18 },
      { id: 'history', icon: Clock, label: 'История' },
      { id: 'liked', icon: Heart, label: 'Понравилось', count: 42 },
    ]
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-white to-narrative-paper-50 border-r border-narrative-paper-300/50 min-h-[calc(100vh-4rem)] flex flex-col">
      
      {/* Профиль пользователя в Sidebar */}
      <div className="p-6 border-b border-narrative-paper-300/50">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-narrative-blue-500 to-narrative-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-r from-narrative-blue-500 to-narrative-purple-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
              <User className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-narrative-ink-900 truncate">Тестовый Автор</p>
            <p className="text-sm text-narrative-ink-500 truncate">Автор · 12 книг</p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-narrative-ink-400">⭐ 4.8 · </span>
              <span className="text-xs text-narrative-ink-400 ml-1">👥 1.2k подписчиков</span>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          
          {/* Основная навигация */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-narrative-ink-400 uppercase tracking-wider mb-3 px-3">
              Главная
            </h3>
            {navItems.main.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-narrative text-left transition-all duration-200 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-narrative-blue-50/80 to-narrative-purple-50/80 text-narrative-blue-700 border-r-4 border-narrative-blue-500'
                    : 'text-narrative-ink-600 hover:bg-narrative-paper-100 hover:text-narrative-ink-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-narrative-blue-500' : 'text-narrative-ink-400'}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-narrative-purple-500 to-pink-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeSection === item.id
                      ? 'bg-white text-narrative-blue-600'
                      : 'bg-narrative-paper-200 text-narrative-ink-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Открыть для себя */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('discover')}
              className="w-full flex items-center justify-between px-3 py-2 mb-2 text-narrative-ink-400 hover:text-narrative-ink-600"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Открыть для себя
              </h3>
              <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${expandedSections.discover ? 'rotate-90' : ''}`} />
            </button>
            
            {expandedSections.discover && (
              <div className="space-y-1">
                {navItems.discover.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-narrative text-left transition-colors duration-200 ${
                      activeSection === item.id
                        ? 'bg-narrative-blue-50 text-narrative-blue-700'
                        : 'text-narrative-ink-600 hover:bg-narrative-paper-100 hover:text-narrative-ink-800'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Мой контент */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('myContent')}
              className="w-full flex items-center justify-between px-3 py-2 mb-2 text-narrative-ink-400 hover:text-narrative-ink-600"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Мой контент
              </h3>
              <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${expandedSections.myContent ? 'rotate-90' : ''}`} />
            </button>
            
            {expandedSections.myContent && (
              <div className="space-y-1">
                {navItems.myContent.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-narrative text-left transition-colors duration-200 ${
                      activeSection === item.id
                        ? 'bg-narrative-blue-50 text-narrative-blue-700'
                        : 'text-narrative-ink-600 hover:bg-narrative-paper-100 hover:text-narrative-ink-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-2 py-1 text-xs bg-narrative-paper-200 text-narrative-ink-500 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Чтение */}
          <div>
            <button
              onClick={() => toggleSection('reading')}
              className="w-full flex items-center justify-between px-3 py-2 mb-2 text-narrative-ink-400 hover:text-narrative-ink-600"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Чтение
              </h3>
              <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${expandedSections.reading ? 'rotate-90' : ''}`} />
            </button>
            
            {expandedSections.reading && (
              <div className="space-y-1">
                {navItems.reading.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-narrative text-left transition-colors duration-200 ${
                      activeSection === item.id
                        ? 'bg-narrative-blue-50 text-narrative-blue-700'
                        : 'text-narrative-ink-600 hover:bg-narrative-paper-100 hover:text-narrative-ink-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-2 py-1 text-xs bg-narrative-paper-200 text-narrative-ink-500 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Промо блок */}
      <div className="p-4 border-t border-narrative-paper-300/50">
        <div className="bg-gradient-to-r from-narrative-blue-50/50 to-narrative-purple-50/50 rounded-narrative p-4 border border-narrative-blue-200/30">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-narrative-blue-500 to-narrative-purple-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-narrative-ink-900">Премиум доступ</p>
              <p className="text-xs text-narrative-ink-500">Без рекламы и ограничений</p>
            </div>
          </div>
          <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-narrative-blue-500 to-narrative-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all duration-200">
            Попробовать
          </button>
        </div>
      </div>

      {/* Настройки внизу */}
      <div className="p-4 border-t border-narrative-paper-300/50">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-narrative text-narrative-ink-600 hover:bg-narrative-paper-100 hover:text-narrative-ink-800 transition-colors duration-200">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Настройки</span>
        </button>
      </div>
    </aside>
  )
}