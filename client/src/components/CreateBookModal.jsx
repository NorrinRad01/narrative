import { useState } from 'react'
import { X, Book, Type, FileText, Tag, Image as ImageIcon } from 'lucide-react'

export default function CreateBookModal({ isOpen, onClose, onBookCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'fantasy',
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const genres = [
    { value: 'fantasy', label: 'Фэнтези' },
    { value: 'scifi', label: 'Научная фантастика' },
    { value: 'detective', label: 'Детектив' },
    { value: 'romance', label: 'Романтика' },
    { value: 'horror', label: 'Ужасы' },
    { value: 'adventure', label: 'Приключения' },
    { value: 'drama', label: 'Драма' },
    { value: 'mystery', label: 'Мистика' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Название книги обязательно')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Здесь будет вызов API
      console.log('Создаем книгу:', formData)
      
      // Имитация успешного создания
      setTimeout(() => {
        alert(`Книга "${formData.title}" успешно создана!`)
        setFormData({
          title: '',
          description: '',
          genre: 'fantasy',
          status: 'draft'
        })
        onBookCreated?.()
        onClose()
      }, 1000)
      
    } catch (err) {
      setError(err.message || 'Ошибка при создании книги')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Book className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Создать новую книгу</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          
          {/* Название */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="h-4 w-4" />
              <span>Название книги *</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Введите название вашей книги..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Придумайте запоминающееся название, которое привлечет читателей
            </p>
          </div>

          {/* Жанр */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4" />
              <span>Жанр *</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.value}
                  type="button"
                  onClick={() => setFormData({...formData, genre: genre.value})}
                  className={`px-4 py-3 rounded-lg border text-center transition-all ${
                    formData.genre === genre.value
                      ? 'bg-primary-50 border-primary-500 text-primary-700 font-semibold'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                  disabled={loading}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              <span>Описание</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Опишите вашу книгу... Что ждет читателей? О чем эта история?"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Хорошее описание поможет привлечь больше читателей
            </p>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус публикации
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.status === 'draft'}
                  onChange={() => setFormData({...formData, status: 'draft'})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-gray-700">Черновик</span>
                <span className="text-sm text-gray-500">(виден только вам)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.status === 'published'}
                  onChange={() => setFormData({...formData, status: 'published'})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-gray-700">Опубликовать</span>
                <span className="text-sm text-gray-500">(видят все)</span>
              </label>
            </div>
          </div>

          {/* Обложка (упрощенно) */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4" />
              <span>Обложка книги</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <div className="w-32 h-48 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Book className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">Нажмите для загрузки обложки</p>
              <p className="text-sm text-gray-500">Рекомендуется: 800x1200px, JPG или PNG</p>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <Book className="h-4 w-4" />
                  <span>Создать книгу</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}