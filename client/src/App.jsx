import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import './App.css'
import { useState, useEffect } from 'react'
import { Book, Flame, Users, Clock } from 'lucide-react'
import { api } from './api/client'
import HeaderNarrative from './components/HeaderNarrative'

// Временная главная страница
function HomePage() {
  // Проверяем авторизацию
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  const [books, setBooks] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadBooks()
}, [])

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
            <h3 className="text-2xl font-bold mb-2">БЕССЕЛЬЕР</h3>
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
        <button className="text-primary-600 hover:text-primary-700 font-medium">
          Смотреть все →
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Загружаем книги...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Пока нет книг</h3>
          <p className="text-gray-500 mb-4">Будьте первым, кто опубликует книгу!</p>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
            Создать первую книгу
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.slice(0, 6).map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
              <div className="flex space-x-4">
                <div className="w-24 h-36 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Book className="h-8 w-8 text-gray-400" />
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
                      <span>👍 {book.likes_count || 0}</span>
                      <span>💬 {book.comments_count || 0}</span>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Читать →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Пример поста из ленты */}
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mr-3"></div>
        <div>
          <h4 className="font-bold">Уважаемый Петров</h4>
          <p className="text-sm text-gray-500">2 часа назад</p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Тень Империи
      </h3>
      <p className="text-gray-600 mb-4">
        Фэнтези - Приключения
      </p>
      <p className="text-gray-700 mb-4">
        В мире, где магия запрещена, один мальчик находит древний артефакт, 
        способный изменить ход истории. Захватывающая сага о дружбе, 
        предательстве и поиске своего предназначения...
      </p>
      
      <div className="flex items-center space-x-6 text-gray-500">
        <span>1.2k 👍</span>
        <span>45 💬</span>
        <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
          Читать сейчас
        </button>
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
        
        <Route 
          path="/" 
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App