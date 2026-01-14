import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, BookOpen, Loader } from 'lucide-react';

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'draft',
    cover_url: ''
  });
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      
      // Получаем книгу с сервера
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/books/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить книгу');
      }
      
      const data = await response.json();
      
      // Преобразуем snake_case в camelCase для удобства
      setBook({
        title: data.title || '',
        description: data.description || '',
        genre: data.genre || '',
        status: data.status || 'draft',
        cover_url: data.cover_url || data.coverUrl || ''
      });
      
      // Устанавливаем preview обложки
      if (data.cover_url || data.coverUrl) {
        const coverUrl = data.cover_url || data.coverUrl;
        setPreviewUrl(coverUrl.startsWith('http') ? coverUrl : `http://localhost:3001${coverUrl}`);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading book:', err);
      setError('Не удалось загрузить данные книги');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      // Проверка размера (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }
      
      setCoverFile(file);
      
      // Создаем preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCover = async (file) => {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/uploads/cover', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Извлекаем URL из разных форматов ответа
      let coverUrl = '';
      if (result.url) {
        coverUrl = result.url;
      } else if (result.file && result.file.url) {
        coverUrl = result.file.url;
      } else if (result.filename) {
        coverUrl = `/uploads/${result.filename}`;
      }
      
      return coverUrl;
      
    } catch (err) {
      console.error('Upload error:', err);
      alert('Не удалось загрузить обложку');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      let cover_url = book.cover_url;
      
      // Загружаем новую обложку если есть
      if (coverFile) {
        const uploadedUrl = await uploadCover(coverFile);
        if (uploadedUrl) {
          cover_url = uploadedUrl;
        }
      }

      // Обновляем книгу на сервере
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...book,
          cover_url: cover_url
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Ошибка сохранения книги');
      }
      
      // Обновляем ленту если книга опубликована
      if (book.status === 'published') {
        try {
          const feed = JSON.parse(localStorage.getItem('bookFeed') || '[]');
          const updatedFeed = feed.map(item => {
            if (item.id === parseInt(id) || item.bookId === parseInt(id)) {
              return {
                ...item,
                title: book.title,
                description: book.description,
                genre: book.genre,
                coverUrl: cover_url,
                updatedAt: new Date().toISOString()
              };
            }
            return item;
          });
          localStorage.setItem('bookFeed', JSON.stringify(updatedFeed));
        } catch (e) {
          console.log('Не удалось обновить ленту:', e);
        }
      }
      
      alert('Книга успешно обновлена!');
      navigate('/my-books');
      
    } catch (err) {
      console.error('Error saving book:', err);
      setError(err.message || 'Ошибка при сохранении книги');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Хедер */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/my-books')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Редактировать книгу</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - обложка */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Обложка</h3>
              
              <div className="mb-4">
                <div className="h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Обложка"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Загрузить новую обложку
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      disabled={saving}
                    />
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center">
                      <Upload className="h-5 w-5 inline-block mr-2" />
                      <span className="text-gray-600">Выбрать файл</span>
                    </div>
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Рекомендуемый размер: 600×800px
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка - форма */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название книги *
                </label>
                <input
                  type="text"
                  name="title"
                  value={book.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите название книги"
                  disabled={saving}
                />
              </div>

              {/* Жанр */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Жанр
                </label>
                <select
                  name="genre"
                  value={book.genre || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="">Выберите жанр</option>
                  <option value="Фэнтези">Фэнтези</option>
                  <option value="Фантастика">Фантастика</option>
                  <option value="Романтика">Романтика</option>
                  <option value="Детектив">Детектив</option>
                  <option value="Драма">Драма</option>
                  <option value="Приключения">Приключения</option>
                  <option value="Поэзия">Поэзия</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={book.description || ''}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Опишите вашу книгу..."
                  disabled={saving}
                />
              </div>

              {/* Статус */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['draft', 'published', 'archived'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={book.status === status}
                        onChange={handleInputChange}
                        className="sr-only"
                        disabled={saving}
                      />
                      <div className={`w-full px-4 py-3 border rounded-lg text-center cursor-pointer transition-all ${
                        book.status === status
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        {status === 'draft' && 'Черновик'}
                        {status === 'published' && 'Опубликовано'}
                        {status === 'archived' && 'Архив'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/my-books')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving || !book.title.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Сохранить изменения
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}