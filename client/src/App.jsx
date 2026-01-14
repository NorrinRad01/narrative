import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import './App.css'
import { useState, useEffect } from 'react'
import { 
  Book, 
  Flame, 
  Users, 
  Clock,
  Heart,        
  MessageSquare, 
  Bookmark,      
  Eye,           
  ChevronRight   
} from 'lucide-react'
import { api } from './api/client'

// Импорт новых страниц
import MyBooksPage from './pages/MyBooksPage'
import DraftsPage from './pages/DraftsPage'
import PublishedPage from './pages/PublishedPage'
import ArchivePage from './pages/ArchivePage'
import GenresPage from './pages/GenresPage'
import TrendingPage from './pages/TrendingPage'
import NewPage from './pages/NewPage'
import RecommendedPage from './pages/RecommendedPage'
import AuthorsPage from './pages/AuthorsPage'
import CollectionsPage from './pages/CollectionsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import EditBookPage from './pages/EditBookPage';
import ChaptersPage from './pages/ChaptersPage';
// Временная главная страница (оставляем ваш оригинальный код)
function HomePage() {
  const token = localStorage.getItem('token');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletedBookIds, setDeletedBookIds] = useState([]);

useEffect(() => {
  const handleBookDeleted = () => {
    console.log('Книга удалена, обновляем ленту');
    loadBooks();
    setDeletedBookIds(prev => [...prev, Date.now()]); // Триггер обновления
  };
  
  window.addEventListener('bookDeleted', handleBookDeleted);
  
  return () => {
    window.removeEventListener('bookDeleted', handleBookDeleted);
  };
}, []);
const filteredBooks = (books || [])
  .filter(book => !deletedBookIds.includes(book.id)) // Фильтруем удаленные
  .slice(0, 6);

  const loadBooks = async () => {
    try {
      const response = await api.getBooks()
      setBooks(response.books || [])
    } catch (error) {
      console.error('Ошибка загрузки книг:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (!token) {
    return <Navigate to="/login" />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Добро пожаловать в Narrative!
          </h1>
          <p className="text-gray-600 mt-2">
            Платформа для авторов и читателей
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">42</div>
            <div className="text-sm text-gray-500">Книги</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1.2k</div>
            <div className="text-sm text-gray-500">Читатели</div>
          </div>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Всего книг</p>
              <p className="text-2xl font-bold">{books.length}</p>
            </div>
            <Book className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">В тренде</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Авторы</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Читают сейчас</p>
              <p className="text-2xl font-bold">342</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Блок "Интересное сегодня" */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Интересное сегодня</h2>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">БЕСТСЕЛЛЕР</h3>
              <p className="mb-2 text-lg">Забытые Королевства</p>
              <p className="text-purple-100">Эпическое фэнтези о магии и драконах</p>
            </div>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50">
              Читать →
            </button>
          </div>
        </div>
      </div>

{/* Список книг */}
<div className="mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-gray-900">📚 Недавние книги</h2>
    <button className="text-blue-600 hover:text-blue-700 font-medium">
      Смотреть все →
    </button>
  </div>
  
  {loading ? (
    <div className="text-center py-8">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-2 text-gray-600">Загружаем книги...</p>
    </div>
  ) : books.length === 0 ? (
    <div className="text-center py-12 bg-gray-50 rounded-xl">
      <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Пока нет книг</h3>
      <p className="text-gray-500 mb-4">Будьте первым, кто опубликует книгу!</p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Создать первую книгу
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books
        .filter(book => book.status === 'published') // Только опубликованные
        .slice(0, 6) // Максимум 6 книг
        .map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex space-x-4">
              {/* Обложка книги */}
              <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                {book.cover_url || book.coverUrl ? (
                  <img 
                    src={book.cover_url ? `http://localhost:3001${book.cover_url}` : 
                          book.coverUrl ? `http://localhost:3001${book.coverUrl}` : ''}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Book class="h-8 w-8 text-gray-400" />
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Book className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {book.author_name || 'Автор'}
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {book.genre || 'Фэнтези'}
                  </span>
                </p>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {book.description || 'Описание пока не добавлено...'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👍 {book.likes_count || book.likes || 0}</span>
                    <span>💬 {book.comments_count || 0}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Читать →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      }
      
      {/* Также показываем книги из localStorage ленты */}
      {(() => {
        const feedBooks = JSON.parse(localStorage.getItem('bookFeed') || '[]')
          .filter(item => item.type === 'book' && item.status === 'published')
          .slice(0, 3);
        
        if (feedBooks.length > 0) {
          return feedBooks.map((item, index) => (
            <div key={`feed-${index}`} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
              <div className="flex space-x-4">
                <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                  {item.coverUrl ? (
                    <img 
                      src={item.coverUrl.startsWith('http') ? item.coverUrl : `http://localhost:3001${item.coverUrl}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Book class="h-8 w-8 text-gray-400" />
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Book className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.author || 'Автор'}
                    <span className="mx-2">•</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {item.genre || 'Фэнтези'}
                    </span>
                  </p>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {item.description || 'Описание пока не добавлено...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👍 0</span>
                      <span>💬 0</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Читать →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ));
        }
        return null;
      })()}
    </div>
  )}
</div>

      {/* Пример поста из ленты */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
  {/* Верхняя часть с автором */}
  <div className="p-6 pb-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3 flex items-center justify-center text-white font-bold">
          УП
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Уважаемый Петров</h4>
          <p className="text-sm text-gray-500 flex items-center">
            <span>2 часа назад</span>
            <span className="mx-2">•</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
              Автор месяца
            </span>
          </p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        •••
      </button>
    </div>
    
    {/* Заголовок и жанр */}
    <div className="flex items-start space-x-6 mb-4">
      {/* Увеличенная обложка */}
      <div className="w-32 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md flex items-center justify-center">
        <Book className="h-12 w-12 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-900">Тень Империи</h3>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full">
            Фэнтези
          </span>
        </div>
        <p className="text-gray-600 mb-3">Приключения • 12+ • 5 глав</p>
        
        <p className="text-gray-700 text-lg leading-relaxed">
          В мире, где магия запрещена, один мальчик находит древний артефакт, 
          способный изменить ход истории. Захватывающая сага о дружбе, 
          предательстве и поиске своего предназначения...
        </p>
      </div>
    </div>
    
    {/* Статистика и действия */}
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="flex items-center space-x-6">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
          <Heart className="h-5 w-5" />
          <span className="font-medium">1.2k</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">45</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
          <Bookmark className="h-5 w-5" />
          <span className="font-medium">89</span>
        </button>
        <div className="flex items-center text-gray-500">
          <Eye className="h-4 w-4 mr-1" />
          <span className="text-sm">2.4k прочитали</span>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300">
          Читать сейчас
        </button>
        <button className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
          Подробнее
        </button>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Все защищённые маршруты */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id/chapters" element={<ChaptersPage />} />
          
          {/* Главная навигация */}
          <Route path="/feed" element={<HomePage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/recommended" element={<RecommendedPage />} />
          
          {/* Открыть для себя */}
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/popular" element={<TrendingPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          
          {/* Мой контент */}
          <Route path="/my-books" element={<MyBooksPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/published" element={<PublishedPage />} />
          <Route path="/archive" element={<ArchivePage />} />

          {/* НОВЫЙ МАРШРУТ ДЛЯ РЕДАКТИРОВАНИЯ КНИГИ */}
          <Route path="/books/edit/:id" element={<EditBookPage />} />
          
          {/* Профиль и настройки */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Резервный редирект */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App